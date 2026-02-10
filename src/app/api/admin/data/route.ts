import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import {
  getAnalyticsSummary,
  isSupabaseConfigured,
} from '@/lib/analytics-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          data: {
            totals: {
              sessions: 0,
              pageViews: 0,
              formSubmissions: 0,
              avgSessionTimeMs: 0,
            },
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

    const data = await getAnalyticsSummary(30);

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
