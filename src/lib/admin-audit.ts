import 'server-only';

import { createClient } from '@supabase/supabase-js';

export type AdminAuditEventInput = {
  actor: string;
  eventType: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
};

type AdminAuditRow = {
  id: string;
  created_at: string;
  actor: string;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function sanitizeActor(value: string): string {
  return value.trim().slice(0, 120) || 'unknown';
}

function sanitizeLabel(value: string): string {
  return value.trim().slice(0, 120);
}

function isMissingAuditTableError(
  error: { code?: string; message?: string } | null
) {
  if (!error) return false;
  if (error.code === '42P01') return true;
  if (error.code === 'PGRST205') {
    return (error.message || '').includes('admin_audit_log');
  }
  return false;
}

export async function logAdminAuditEvent(
  input: AdminAuditEventInput
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      actor: sanitizeActor(input.actor),
      event_type: sanitizeLabel(input.eventType),
      target_type: input.targetType ? sanitizeLabel(input.targetType) : null,
      target_id: input.targetId ? sanitizeLabel(input.targetId) : null,
      metadata: input.metadata || {},
    };

    const { error } = await supabase.from('admin_audit_log').insert(payload);
    if (error) {
      // Ignore missing-table errors to avoid taking down core workflows.
      if (isMissingAuditTableError(error)) return false;
      console.error('Failed to write admin audit log:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin audit logging crashed:', error);
    return false;
  }
}

export async function listAdminAuditEvents(options?: {
  limit?: number;
  before?: string | null;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      rows: [] as AdminAuditRow[],
      nextCursor: null as string | null,
      error: 'Supabase not configured',
    };
  }

  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 200);
  let query = supabase
    .from('admin_audit_log')
    .select('id,created_at,actor,event_type,target_type,target_id,metadata')
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (options?.before) {
    query = query.lt('created_at', options.before);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingAuditTableError(error)) {
      return { rows: [] as AdminAuditRow[], nextCursor: null, error: null };
    }
    return {
      rows: [] as AdminAuditRow[],
      nextCursor: null,
      error: error.message,
    };
  }

  const rows = (data || []) as AdminAuditRow[];
  const hasNextPage = rows.length > limit;
  const pageRows = hasNextPage ? rows.slice(0, limit) : rows;
  const nextCursor = hasNextPage
    ? pageRows[pageRows.length - 1]?.created_at
    : null;

  return {
    rows: pageRows,
    nextCursor: nextCursor || null,
    error: null as string | null,
  };
}
