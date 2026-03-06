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

  // This endpoint used to send Resend "preview" emails for the in-repo outreach templates.
  // Outreach delivery is now handled by MailerLite automation, so previews are disabled here.
  try {
    await logAdminAuditEvent({
      actor: session.username,
      eventType: 'outreach_preview_send_disabled',
      targetType: 'outreach',
      targetId: null,
      metadata: {
        at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to audit disabled preview-send attempt:', error);
  }

  return NextResponse.json(
    {
      error:
        'Outreach sending is handled by MailerLite automation. This endpoint is disabled.',
    },
    { status: 410 }
  );
}
