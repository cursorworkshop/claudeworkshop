import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import { logAdminAuditEvent } from '@/lib/admin-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const incoming = new URL(request.url);
  const batchKey = incoming.searchParams.get('batchKey');

  // Outreach sending is now handled by MailerLite automations, not by our internal
  // cron scheduler. Keep the route for a clear error message + audit trail.
  try {
    await logAdminAuditEvent({
      actor: session.username,
      eventType: 'outreach_scheduler_run_disabled',
      targetType: 'outreach',
      targetId: batchKey || 'all',
      metadata: {
        batchKey: batchKey || 'all',
        at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to audit disabled scheduler run:', error);
  }

  return NextResponse.json(
    {
      error:
        'Outreach sending is handled by MailerLite automation. This endpoint is disabled.',
    },
    { status: 410 }
  );
}
