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

  const urlIn = new URL(request.url);
  const batchKey = urlIn.searchParams.get('batchKey') || 'prelaunch';

  // Outreach sending is now handled by MailerLite automations, not by our internal
  // batch launch helper. Keep the route for a clear error message + audit trail.
  try {
    await logAdminAuditEvent({
      actor: session.username,
      eventType: 'outreach_batch_launch_disabled',
      targetType: 'outreach',
      targetId: batchKey,
      metadata: {
        batchKey,
        at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to audit disabled batch launch:', error);
  }

  return NextResponse.json(
    {
      error:
        'Outreach sending is handled by MailerLite automation. This endpoint is disabled.',
    },
    { status: 410 }
  );
}
