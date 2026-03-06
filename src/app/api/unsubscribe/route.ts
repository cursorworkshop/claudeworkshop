import { NextRequest, NextResponse } from 'next/server';

import { logAdminAuditEvent } from '@/lib/admin-audit';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isMissingColumnError(
  error: { code?: string; message?: string } | null,
  columnName: string
) {
  if (!error) return false;
  if (error.code !== '42703' && error.code !== 'PGRST204') return false;
  return (error.message || '').toLowerCase().includes(columnName.toLowerCase());
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    const payload = (await request.json()) as { token?: unknown };
    const token = typeof payload.token === 'string' ? payload.token.trim() : '';

    if (!token || !UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id,email,archived')
      .eq('id', token)
      .single();

    if (leadError || !lead?.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.archived === true) {
      return NextResponse.json({ ok: true });
    }

    const leadEmail = String(lead.email || '')
      .trim()
      .toLowerCase();
    if (!leadEmail) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update({ archived: true })
      // Dedupe across any historical case inconsistencies.
      .ilike('email', leadEmail);

    if (updateError) {
      if (isMissingColumnError(updateError, 'archived')) {
        return NextResponse.json(
          { error: 'Unsubscribe is not configured' },
          { status: 500 }
        );
      }

      console.error('Failed to archive lead on unsubscribe:', updateError);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    await logAdminAuditEvent({
      actor: 'public',
      eventType: 'lead_unsubscribed',
      targetType: 'lead',
      targetId: lead.id,
      metadata: { email: leadEmail, at: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Unsubscribe failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
