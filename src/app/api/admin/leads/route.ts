import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import { logAdminAuditEvent } from '@/lib/admin-audit';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function sanitizeName(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, 100);
}

function sanitizeSource(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 120);
}

function sanitizeEmail(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().slice(0, 320);
}

function composeFullName(firstName: string, lastName: string): string | null {
  const full = `${firstName} ${lastName}`.trim();
  return full || null;
}

function isMissingColumnError(
  error: { code?: string; message?: string } | null,
  columnName: string
) {
  if (!error) return false;
  if (error.code !== '42703' && error.code !== 'PGRST204') return false;
  return (error.message || '').toLowerCase().includes(columnName.toLowerCase());
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      source?: unknown;
      email?: unknown;
      firstName?: unknown;
      lastName?: unknown;
    };

    const source = sanitizeSource(payload.source) || 'other_manual';
    const email = sanitizeEmail(payload.email);
    const firstName = sanitizeName(payload.firstName);
    const lastName = sanitizeName(payload.lastName);
    const fullName = composeFullName(firstName, lastName);

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data: existingLead, error: existingError } = await supabase
      .from('leads')
      .select('id,email')
      .ilike('email', email)
      .maybeSingle();

    if (existingError) {
      console.error('Failed to check existing lead:', existingError);
      return NextResponse.json(
        { error: 'Failed to validate lead uniqueness' },
        { status: 500 }
      );
    }

    if (existingLead?.id) {
      return NextResponse.json(
        { error: 'Lead with this email already exists' },
        { status: 409 }
      );
    }

    const insertPayload: Record<string, unknown> = {
      source,
      email,
      name: fullName,
      first_name: firstName || null,
      last_name: lastName || null,
      archived: false,
    };

    let insertResult = await supabase
      .from('leads')
      .insert(insertPayload)
      .select('*')
      .single();

    if (
      insertResult.error &&
      (isMissingColumnError(insertResult.error, 'first_name') ||
        isMissingColumnError(insertResult.error, 'last_name'))
    ) {
      const fallbackPayload: Record<string, unknown> = {
        source,
        email,
        name: fullName,
      };

      if (!isMissingColumnError(insertResult.error, 'archived')) {
        fallbackPayload.archived = false;
      }

      insertResult = await supabase
        .from('leads')
        .insert(fallbackPayload)
        .select('*')
        .single();
    } else if (
      insertResult.error &&
      isMissingColumnError(insertResult.error, 'archived')
    ) {
      const retryPayload = { ...insertPayload };
      delete retryPayload.archived;
      insertResult = await supabase
        .from('leads')
        .insert(retryPayload)
        .select('*')
        .single();
    }

    if (insertResult.error || !insertResult.data) {
      console.error('Failed to create lead:', insertResult.error);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    await logAdminAuditEvent({
      actor: session.username,
      eventType: 'lead_created_manual',
      targetType: 'lead',
      targetId: insertResult.data.id,
      metadata: {
        email,
        source,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    return NextResponse.json({ success: true, lead: insertResult.data });
  } catch (error) {
    console.error('Lead create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update lead fields (archive status and/or names)
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      id?: unknown;
      archived?: unknown;
      firstName?: unknown;
      lastName?: unknown;
    };

    const id = typeof payload.id === 'string' ? payload.id : '';
    const hasArchived = typeof payload.archived === 'boolean';
    const hasFirstName = payload.firstName !== undefined;
    const hasLastName = payload.lastName !== undefined;

    if (!id || (!hasArchived && !hasFirstName && !hasLastName)) {
      return NextResponse.json(
        { error: 'Missing id or update fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data: leadRow, error: leadFetchError } = await supabase
      .from('leads')
      .select('id,email')
      .eq('id', id)
      .single();

    if (leadFetchError || !leadRow?.email) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const leadEmail = String(leadRow.email).trim().toLowerCase();

    const updatePayload: Record<string, unknown> = {};

    if (hasArchived) {
      updatePayload.archived = payload.archived;
    }

    if (hasFirstName || hasLastName) {
      const existingLeadResult = await supabase
        .from('leads')
        .select('name,first_name,last_name')
        .eq('id', id)
        .single();

      if (
        existingLeadResult.error &&
        isMissingColumnError(existingLeadResult.error, 'first_name')
      ) {
        const fallbackResult = await supabase
          .from('leads')
          .select('name')
          .eq('id', id)
          .single();

        if (fallbackResult.error || !fallbackResult.data) {
          console.error(
            'Failed to fetch lead before name update:',
            fallbackResult.error
          );
          return NextResponse.json(
            { error: 'Lead not found' },
            { status: 404 }
          );
        }

        const fallbackName =
          typeof fallbackResult.data.name === 'string'
            ? fallbackResult.data.name.trim()
            : '';
        const [fallbackFirst, ...fallbackRest] = fallbackName.split(/\s+/);

        const firstName = hasFirstName
          ? sanitizeName(payload.firstName)
          : sanitizeName(fallbackFirst || '');
        const lastName = hasLastName
          ? sanitizeName(payload.lastName)
          : sanitizeName(fallbackRest.join(' '));

        updatePayload.name = composeFullName(firstName, lastName);
      } else if (existingLeadResult.error || !existingLeadResult.data) {
        console.error(
          'Failed to fetch lead before name update:',
          existingLeadResult.error
        );
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      } else {
        const firstName = hasFirstName
          ? sanitizeName(payload.firstName)
          : sanitizeName(existingLeadResult.data.first_name);
        const lastName = hasLastName
          ? sanitizeName(payload.lastName)
          : sanitizeName(existingLeadResult.data.last_name);

        updatePayload.first_name = firstName || null;
        updatePayload.last_name = lastName || null;
        updatePayload.name = composeFullName(firstName, lastName);
      }
    }

    const { error } = await supabase
      .from('leads')
      .update(updatePayload)
      // Dedupe across any historical case inconsistencies.
      .ilike('email', leadEmail);

    if (error && isMissingColumnError(error, 'archived') && hasArchived) {
      if (!hasFirstName && !hasLastName) {
        return NextResponse.json(
          {
            error:
              'Archive state is unavailable on this database. Run migration 20260204_add_leads_archived.sql.',
          },
          { status: 409 }
        );
      }

      const { archived: _ignored, ...retryPayload } = updatePayload;
      const retryResult = await supabase
        .from('leads')
        .update(retryPayload)
        .ilike('email', leadEmail);

      if (retryResult.error) {
        console.error('Failed to update lead:', retryResult.error);
        return NextResponse.json(
          { error: 'Failed to update lead' },
          { status: 500 }
        );
      }
    } else if (error) {
      console.error('Failed to update lead:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    if (hasArchived) {
      await logAdminAuditEvent({
        actor: session.username,
        eventType: payload.archived ? 'lead_archived' : 'lead_unarchived',
        targetType: 'lead',
        targetId: id,
        metadata: {
          email: leadEmail,
          archived: payload.archived,
        },
      });
    }

    if (hasFirstName || hasLastName) {
      await logAdminAuditEvent({
        actor: session.username,
        eventType: 'lead_name_updated',
        targetType: 'lead',
        targetId: id,
        metadata: {
          email: leadEmail,
          firstName: hasFirstName ? sanitizeName(payload.firstName) : undefined,
          lastName: hasLastName ? sanitizeName(payload.lastName) : undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Permanently delete a lead (and related outreach logs)
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let leadId = '';

    try {
      const payload = (await request.json()) as { id?: unknown };
      leadId = typeof payload.id === 'string' ? payload.id : '';
    } catch {
      // DELETE bodies are allowed, but some clients omit them. Fallback to query param.
      const { searchParams } = new URL(request.url);
      leadId = searchParams.get('id') || '';
    }

    if (!leadId) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id,email,source')
      .eq('id', leadId)
      .maybeSingle();

    if (leadError) {
      console.error('Failed to fetch lead before delete:', leadError);
      return NextResponse.json(
        { error: 'Failed to validate lead' },
        { status: 500 }
      );
    }

    if (!lead?.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const leadEmail = String(lead.email || '')
      .trim()
      .toLowerCase();

    if (!leadEmail) {
      return NextResponse.json({ error: 'Lead has no email' }, { status: 409 });
    }

    const { error: outreachDeleteError } = await supabase
      .from('outreach_log')
      .delete()
      .ilike('email', leadEmail);

    if (outreachDeleteError && outreachDeleteError.code !== '42P01') {
      console.error('Failed to delete outreach log rows:', outreachDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete outreach history for lead' },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      // Dedupe across any historical case inconsistencies.
      .ilike('email', leadEmail);

    if (deleteError) {
      console.error('Failed to delete lead:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    await logAdminAuditEvent({
      actor: session.username,
      eventType: 'lead_deleted',
      targetType: 'lead',
      targetId: lead.id,
      metadata: {
        email: leadEmail,
        source: lead.source,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get leads with archive filter
export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true';
    const limitParam = Number(searchParams.get('limit') || 200);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 500)
      : 200;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data: allLeads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    const leads = (allLeads || []).filter(lead => {
      const isArchived = lead.archived === true;
      return showArchived ? isArchived : !isArchived;
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Lead fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
