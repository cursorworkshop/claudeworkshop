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

  let leadId: string | null = null;
  try {
    const payload = (await request.json()) as { leadId?: unknown };
    leadId = typeof payload.leadId === 'string' ? payload.leadId : null;
  } catch {
    // Ignore JSON parse errors; we still want to return a clear disabled response.
  }

  // Outreach email sending is now handled by MailerLite automations.
  try {
    await logAdminAuditEvent({
      actor: session.username,
      eventType: 'outreach_send_next_disabled',
      targetType: 'outreach',
      targetId: leadId,
      metadata: {
        leadId,
        at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to audit disabled send-next attempt:', error);
  }

  return NextResponse.json(
    {
      error:
        'Outreach sending is handled by MailerLite automation. This endpoint is disabled.',
    },
    { status: 410 }
  );
}
