import { NextRequest, NextResponse } from 'next/server';

import { siteConfig } from '@/lib/config';
import { storeEvent, storeSession } from '@/lib/analytics-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TARGETS: Record<string, string> = {
  call: siteConfig.bookings.callUrl,
  luma: siteConfig.bookings.lumaUrl,
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function safeNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params;
  const target = TARGETS[key];

  if (!target) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const tokenParam = (searchParams.get('t') || '').trim();
  const step = safeNumber(searchParams.get('s'));
  const leadToken = tokenParam && isUuid(tokenParam) ? tokenParam : null;

  // Best-effort tracking: if anything fails, still redirect.
  try {
    const sessionId = `r_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const referrer = request.headers.get('referer') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    await storeSession({
      session_id: sessionId,
      started_at: now,
      last_activity_at: now,
      referrer,
      landing_page: `/r/${key}`,
      utm_source: 'outreach',
      utm_medium: 'email',
      utm_campaign:
        typeof step === 'number' ? `outreach_step_${step}` : undefined,
      utm_content: key,
      user_agent: userAgent,
      is_bot: false,
    });

    await storeEvent({
      session_id: sessionId,
      event_name:
        key === 'call' ? 'outreach_click_call' : 'outreach_click_luma',
      event_category: 'conversion',
      event_data: {
        step,
        leadToken,
        target,
      },
      element_href: target,
    });
  } catch (error) {
    console.error('Redirect tracking failed:', error);
  }

  return NextResponse.redirect(target, 302);
}
