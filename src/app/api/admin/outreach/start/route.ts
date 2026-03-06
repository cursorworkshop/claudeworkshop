import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
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
    const payload = (await request.json()) as { leadId?: unknown };
    const leadId = typeof payload.leadId === 'string' ? payload.leadId : '';

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id,email,archived')
      .eq('id', leadId)
      .single();

    if (leadError || !lead?.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.archived === true) {
      return NextResponse.json({ error: 'Lead is archived' }, { status: 409 });
    }

    const normalizedEmail = String(lead.email || '')
      .trim()
      .toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Lead has no email' }, { status: 409 });
    }

    // De-dupe by email: only one sequence per contact, even if the leads table has duplicates.
    const { data: existingStart, error: existingStartError } = await supabase
      .from('outreach_log')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('step', 0)
      .limit(1)
      .maybeSingle();

    if (existingStartError && existingStartError.code !== '42P01') {
      console.error(
        'Failed to check existing outreach start:',
        existingStartError
      );
      return NextResponse.json(
        { error: 'Failed to validate outreach start state' },
        { status: 500 }
      );
    }

    if (existingStart?.id) {
      return NextResponse.json(
        { error: 'Lead already started' },
        { status: 409 }
      );
    }

    const startedAt = new Date().toISOString();
    const { error: insertError } = await supabase.from('outreach_log').insert({
      lead_id: lead.id,
      email: normalizedEmail,
      step: 0,
      sent_at: startedAt,
      resend_id: null,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Lead already started' },
          { status: 409 }
        );
      }

      console.error('Failed to start outreach:', insertError);
      return NextResponse.json(
        { error: 'Failed to start outreach' },
        { status: 500 }
      );
    }

    await logAdminAuditEvent({
      actor: session.username,
      eventType: 'outreach_started',
      targetType: 'lead',
      targetId: lead.id,
      metadata: { email: lead.email, startedAt },
    });

    return NextResponse.json({ ok: true, leadId: lead.id, startedAt });
  } catch (error) {
    console.error('Outreach start failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
