import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import {
  getAnalyticsSummary,
  isSupabaseConfigured,
} from '@/lib/analytics-supabase';
import { siteConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = Number(searchParams.get('range') || '30');
    const range = [7, 30, 90].includes(rangeParam) ? rangeParam : 30;
    const compareParam = searchParams.get('compare');
    const compare = compareParam === null ? true : compareParam !== 'false';

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          data: {
            period: {
              days: range,
              start: new Date().toISOString(),
              end: new Date().toISOString(),
              previousStart: new Date().toISOString(),
              previousEnd: new Date().toISOString(),
              compareEnabled: compare,
            },
            totals: {
              sessions: 0,
              pageViews: 0,
              formSubmissions: 0,
              leads: 0,
              avgSessionTimeMs: 0,
              avgSessionDurationMs: 0,
              bounceRate: 0,
              engagedSessions: 0,
              pagesPerSession: 0,
            },
            uniqueSessions: {
              ever: 0,
              range: 0,
              dailyAverage: 0,
              previousRange: 0,
            },
            comparison: {
              sessions: { current: 0, previous: 0, deltaPercent: 0 },
              uniqueRange: { current: 0, previous: 0, deltaPercent: 0 },
              leads: { current: 0, previous: 0, deltaPercent: 0 },
            },
            cal: {
              url: siteConfig.bookings.callUrl,
              configured: false,
              warning: 'Cal.com not configured (missing CALCOM_API_KEY).',
              callClicks: 0,
              callClicksPrevious: 0,
              bookings: 0,
              bookingsCancelled: 0,
              bookingsPrevious: 0,
              bookingsCancelledPrevious: 0,
              clickToBookingRate: 0,
              clickToBookingRatePrevious: 0,
            },
            trends: [],
            sourceMix: [],
            campaignTable: [],
            channels: [],
            referrers: [],
            devices: [],
            countries: [],
            pages: [],
            recentSubmissions: [],
          },
          warning:
            'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable analytics.',
        },
        { status: 200 }
      );
    }

    const data = await getAnalyticsSummary(range, { compare });

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to load analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Admin analytics fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    );
  }
}
