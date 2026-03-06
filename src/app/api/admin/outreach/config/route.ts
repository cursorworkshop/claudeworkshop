import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import { logAdminAuditEvent } from '@/lib/admin-audit';
import {
  getOutreachAutomationConfig,
  setOutreachAutomationConfig,
} from '@/lib/outreach-config-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await getOutreachAutomationConfig();
  return NextResponse.json({ config });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    paused?: unknown;
    batching?: unknown;
  };
  const paused = payload.paused === true;

  try {
    const patch: any = { paused };

    if (payload.batching && typeof payload.batching === 'object') {
      const raw = payload.batching as any;
      const enabled =
        typeof raw.enabled === 'boolean' ? raw.enabled : undefined;
      const windowDays = Number.isFinite(raw.windowDays)
        ? Math.max(1, Math.floor(Number(raw.windowDays)))
        : undefined;

      let launchCutoffIso: string | undefined = undefined;
      if (typeof raw.launchCutoffIso === 'string') {
        const parsed = new Date(raw.launchCutoffIso);
        if (!Number.isNaN(parsed.getTime())) {
          launchCutoffIso = parsed.toISOString();
        }
      }

      patch.batching = {
        ...(enabled !== undefined ? { enabled } : {}),
        ...(windowDays !== undefined ? { windowDays } : {}),
        ...(launchCutoffIso ? { launchCutoffIso } : {}),
      };
    }

    const config = await setOutreachAutomationConfig(patch);

    await logAdminAuditEvent({
      actor: session.username,
      eventType: paused ? 'outreach_paused' : 'outreach_resumed',
      targetType: 'outreach',
      targetId: null,
      metadata: { paused: config.paused },
    });

    if (payload.batching) {
      await logAdminAuditEvent({
        actor: session.username,
        eventType: 'outreach_batching_updated',
        targetType: 'outreach',
        targetId: null,
        metadata: { batching: config.batching },
      });
    }

    return NextResponse.json({ ok: true, config });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update config',
      },
      { status: 500 }
    );
  }
}
