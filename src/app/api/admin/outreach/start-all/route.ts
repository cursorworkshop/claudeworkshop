import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import { logAdminAuditEvent } from '@/lib/admin-audit';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Keep in sync with the outreach dashboard + cron sender.
const AUTO_OUTREACH_SOURCES = new Set([
  'white_paper_download',
  'white_paper_landing',
  'exit_intent',
]);

const PAGE_SIZE = 1000;

type LeadRow = {
  id: string;
  email: string;
  source: string;
  created_at: string;
  archived?: boolean | null;
};

function isMissingColumnError(
  error: { code?: string; message?: string } | null,
  columnName: string
) {
  if (!error) return false;
  if (error.code !== '42703' && error.code !== 'PGRST204') return false;
  return (error.message || '').toLowerCase().includes(columnName.toLowerCase());
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function fetchAllRows<T>(
  fetchPage: (
    from: number,
    to: number
  ) => Promise<{
    data: T[] | null;
    error: { code?: string; message?: string } | null;
  }>
) {
  const rows: T[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await fetchPage(from, to);

    if (error) {
      return { rows: null as T[] | null, error };
    }

    if (!data?.length) break;
    rows.push(...data);

    if (data.length < PAGE_SIZE) break;
  }

  return { rows, error: null };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    const { rows: leads, error: leadsError } = await fetchAllRows<LeadRow>(
      async (from, to) => {
        const withArchived = await supabase
          .from('leads')
          .select('id,email,source,created_at,archived')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (isMissingColumnError(withArchived.error, 'archived')) {
          const fallback = await supabase
            .from('leads')
            .select('id,email,source,created_at')
            .order('created_at', { ascending: false })
            .range(from, to);

          return {
            data: fallback.data as LeadRow[] | null,
            error: fallback.error,
          };
        }

        return {
          data: withArchived.data as LeadRow[] | null,
          error: withArchived.error,
        };
      }
    );

    if (leadsError || !leads) {
      console.error('Failed to fetch leads for bulk start:', leadsError);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    const leadsByEmail = new Map<string, LeadRow[]>();
    for (const lead of leads) {
      const email = normalizeEmail(lead.email || '');
      if (!email) continue;
      const existing = leadsByEmail.get(email) || [];
      existing.push(lead);
      leadsByEmail.set(email, existing);
    }

    const canonicalByEmail = new Map<string, LeadRow>();
    for (const [email, emailLeads] of leadsByEmail.entries()) {
      const isArchived = emailLeads.some(lead => lead.archived === true);
      if (isArchived) continue;

      const isAutoSource = emailLeads.some(lead =>
        AUTO_OUTREACH_SOURCES.has(lead.source)
      );
      if (isAutoSource) continue;

      const canonical = [...emailLeads].sort((a, b) =>
        b.created_at.localeCompare(a.created_at)
      )[0];
      if (!canonical?.id) continue;
      canonicalByEmail.set(email, canonical);
    }

    const candidateEmails = Array.from(canonicalByEmail.keys());
    if (candidateEmails.length === 0) {
      return NextResponse.json({ ok: true, started: 0, skipped: 0 });
    }

    const startedEmails = new Set<string>();
    const emailChunks = chunk(candidateEmails, 400);
    for (const emails of emailChunks) {
      const { data: existingStarts, error: existingError } = await supabase
        .from('outreach_log')
        .select('email')
        .eq('step', 0)
        .in('email', emails);

      if (existingError && existingError.code !== '42P01') {
        console.error('Failed to check outreach start logs:', existingError);
        return NextResponse.json(
          { error: 'Failed to validate outreach start state' },
          { status: 500 }
        );
      }

      for (const row of existingStarts || []) {
        const email = normalizeEmail(String((row as any).email || ''));
        if (email) startedEmails.add(email);
      }
    }

    const startedAt = new Date().toISOString();
    const insertRows = candidateEmails
      .filter(email => !startedEmails.has(email))
      .map(email => {
        const lead = canonicalByEmail.get(email);
        return lead
          ? {
              lead_id: lead.id,
              email,
              step: 0,
              sent_at: startedAt,
              resend_id: null,
            }
          : null;
      })
      .filter(Boolean) as Array<{
      lead_id: string;
      email: string;
      step: number;
      sent_at: string;
      resend_id: null;
    }>;

    let started = 0;
    if (insertRows.length > 0) {
      for (const rows of chunk(insertRows, 200)) {
        const { error: insertError } = await supabase
          .from('outreach_log')
          .upsert(rows, {
            onConflict: 'lead_id,step',
            ignoreDuplicates: true,
          });

        if (insertError) {
          console.error('Failed to bulk start outreach:', insertError);
          return NextResponse.json(
            { error: 'Failed to start outreach for some leads' },
            { status: 500 }
          );
        }

        started += rows.length;
      }
    }

    const skipped = candidateEmails.length - started;

    await logAdminAuditEvent({
      actor: session.username,
      eventType: 'outreach_started_bulk',
      targetType: 'outreach',
      targetId: null,
      metadata: {
        started,
        skipped,
        startedAt,
      },
    });

    return NextResponse.json({ ok: true, started, skipped, startedAt });
  } catch (error) {
    console.error('Bulk outreach start failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
