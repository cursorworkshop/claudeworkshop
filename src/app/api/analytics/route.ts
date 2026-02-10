import { NextRequest, NextResponse } from 'next/server';

import {
  isSupabaseConfigured,
  storeFormSubmission,
  storePageView,
  storeSession,
} from '@/lib/analytics-supabase';
import {
  inferChannel,
  getReferrerHost,
  type AnalyticsPayload,
} from '@/lib/tracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response('Analytics API', { status: 200 });
}

// Parse user agent for device/browser info
function parseUserAgent(ua: string | null) {
  if (!ua) return {};

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  let browser = 'Unknown';
  let browserVersion = '';
  let os = 'Unknown';
  let osVersion = '';

  // Browser detection
  if (ua.includes('Chrome')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
    const match = ua.match(/Edge\/(\d+)/);
    if (match) browserVersion = match[1];
  }

  // OS detection
  if (ua.includes('Windows')) {
    os = 'Windows';
    if (ua.includes('Windows NT 10')) osVersion = '10';
    else if (ua.includes('Windows NT 11')) osVersion = '11';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
    const match = ua.match(/Android (\d+)/);
    if (match) osVersion = match[1];
  } else if (
    ua.includes('iOS') ||
    ua.includes('iPhone') ||
    ua.includes('iPad')
  ) {
    os = 'iOS';
    const match = ua.match(/OS (\d+)/);
    if (match) osVersion = match[1];
  }

  // Bot detection
  const isBot = /bot|crawler|spider|crawling/i.test(ua);

  return { deviceType, browser, browserVersion, os, osVersion, isBot };
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // Fall back to logging only - eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('Analytics received (Supabase not configured)');
      return NextResponse.json({ ok: true, stored: false }, { status: 200 });
    }

    const body = (await request.json()) as AnalyticsPayload & {
      deviceInfo?: {
        screenWidth?: number;
        screenHeight?: number;
        viewportWidth?: number;
        viewportHeight?: number;
        language?: string;
        languages?: string[];
        timezone?: string;
        connectionType?: string;
      };
    };

    if (!body?.session?.id) {
      return NextResponse.json(
        { error: 'Invalid analytics payload' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent');
    const { deviceType, browser, browserVersion, os, osVersion, isBot } =
      parseUserAgent(userAgent);

    // Get geo info from headers (if using Vercel or similar)
    const country = request.headers.get('x-vercel-ip-country') || undefined;
    const countryCode = country;
    const region =
      request.headers.get('x-vercel-ip-country-region') || undefined;
    const city = request.headers.get('x-vercel-ip-city') || undefined;

    const session = body.session;
    const deviceInfo = body.deviceInfo || {};

    // Infer channel
    const channel = inferChannel({
      referrer: session.referrer,
      referrerHost: session.referrerHost,
      utm: session.utm,
    });

    // Store session
    await storeSession({
      session_id: session.id,
      started_at: new Date(session.startedAt).toISOString(),
      referrer: session.referrer || undefined,
      referrer_host:
        session.referrerHost || getReferrerHost(session.referrer) || undefined,
      channel,
      utm_source: session.utm?.source,
      utm_medium: session.utm?.medium,
      utm_campaign: session.utm?.campaign,
      utm_content: session.utm?.content,
      utm_term: session.utm?.term,
      gclid: session.utm?.gclid,
      fbclid: session.utm?.fbclid,
      msclkid: session.utm?.msclkid,
      landing_page: session.landingPath || undefined,
      user_agent: userAgent || undefined,
      device_type: deviceType,
      browser,
      browser_version: browserVersion,
      os,
      os_version: osVersion,
      screen_width: deviceInfo.screenWidth,
      screen_height: deviceInfo.screenHeight,
      viewport_width: deviceInfo.viewportWidth,
      viewport_height: deviceInfo.viewportHeight,
      country,
      country_code: countryCode,
      region,
      city,
      timezone: deviceInfo.timezone,
      language: deviceInfo.language,
      languages: deviceInfo.languages,
      connection_type: deviceInfo.connectionType,
      is_bot: isBot,
    });

    // Store page views
    if (body.pages && body.pages.length > 0) {
      for (const page of body.pages) {
        await storePageView({
          session_id: session.id,
          path: page.path,
          started_at: new Date(page.startedAt).toISOString(),
          ended_at: page.endedAt
            ? new Date(page.endedAt).toISOString()
            : undefined,
          duration_ms: page.durationMs,
        });
      }
    }

    // Store form submission if present
    if (body.submission) {
      const sub = body.submission;
      const pagesCount = body.pages?.length || 0;

      await storeFormSubmission({
        session_id: session.id,
        form_type: sub.formType,
        form_page: sub.pagePath || '/',
        submitter_name: sub.name,
        submitter_email: sub.email,
        inquiry_type: sub.inquiryType,
        pages_before_submit: pagesCount,
        time_to_submit_ms: sub.totalTimeMs,
        channel,
        utm_source: session.utm?.source,
        utm_medium: session.utm?.medium,
        utm_campaign: session.utm?.campaign,
        referrer_host:
          session.referrerHost ||
          getReferrerHost(session.referrer) ||
          undefined,
        landing_page: session.landingPath || undefined,
        device_type: deviceType,
        country,
      });
    }

    return NextResponse.json({ ok: true, stored: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics ingestion failed:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics' },
      { status: 500 }
    );
  }
}
