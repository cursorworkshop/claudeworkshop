import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAILERLITE_BASE_URL = 'https://connect.mailerlite.com';
const MAILERLITE_LEADS_GROUP_ID = '179658323762612095';
const CACHE_TTL_MS = 30_000;

type MailerLiteRate = {
  float?: number;
  string?: string;
};

type MailerLiteGroup = {
  id: string;
  name: string;
  active_count: number;
  sent_count: number;
  opens_count: number;
  open_rate: MailerLiteRate;
  clicks_count: number;
  click_rate: MailerLiteRate;
  unsubscribed_count: number;
  unconfirmed_count: number;
  bounced_count: number;
  junk_count: number;
  created_at: string;
};

type MailerLiteSubscriber = {
  id: string;
  email: string;
  status: string;
  source?: string | null;
  subscribed_at: string;
  created_at: string;
  updated_at: string;
  opens_count?: number;
  clicks_count?: number;
  open_rate?: number;
  click_rate?: number;
  fields?: Record<string, unknown>;
};

type MailerLiteGroupResponse = { data: MailerLiteGroup };
type MailerLiteSubscribersResponse = {
  data: MailerLiteSubscriber[];
  meta?: { next_cursor?: string | null; per_page?: number };
};

let cache: {
  key: string;
  loadedAt: number;
  value: unknown;
} | null = null;

function safeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeRangeDays(value: unknown): 7 | 30 | 90 {
  const num = Number(value);
  if (num === 7 || num === 30 || num === 90) return num;
  return 30;
}

function datePart(value: string): string {
  // MailerLite uses "YYYY-MM-DD HH:mm:ss" in many responses.
  return String(value || '').split(' ')[0] || '';
}

function buildRangeDates(days: number): string[] {
  const dates: string[] = [];
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }

  return dates;
}

async function mailerLiteFetch(path: string, init?: RequestInit) {
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) {
    throw new Error('MAILERLITE_API_KEY not configured');
  }

  const url = new URL(path, MAILERLITE_BASE_URL);
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `MailerLite API failed (${response.status}): ${text.slice(0, 200)}`
    );
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rangeDays = normalizeRangeDays(searchParams.get('range'));

  const cacheKey = `range:${rangeDays}`;
  if (
    cache &&
    cache.key === cacheKey &&
    Date.now() - cache.loadedAt < CACHE_TTL_MS
  ) {
    return NextResponse.json(cache.value, { status: 200 });
  }

  try {
    const groupJson = (await mailerLiteFetch(
      `/api/groups/${MAILERLITE_LEADS_GROUP_ID}`
    )) as MailerLiteGroupResponse;

    // Fetch subscribers for the group. We pull more than we need, but stop early
    // when we can (older than cutoff).
    const cutoffIso = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const subscribers: MailerLiteSubscriber[] = [];
    let cursor: string | null = null;

    for (let page = 0; page < 30; page += 1) {
      const url = new URL('/api/subscribers', MAILERLITE_BASE_URL);
      url.searchParams.set('limit', '100');
      url.searchParams.set('filter[group]', MAILERLITE_LEADS_GROUP_ID);
      if (cursor) url.searchParams.set('cursor', cursor);

      const json = (await mailerLiteFetch(url.pathname + url.search)) as
        | MailerLiteSubscribersResponse
        | unknown;

      const response = json as MailerLiteSubscribersResponse;
      const rows = Array.isArray(response.data) ? response.data : [];
      subscribers.push(...rows);

      cursor = response.meta?.next_cursor
        ? String(response.meta.next_cursor)
        : null;

      // Heuristic early-exit: this endpoint appears to be sorted by subscribed_at (desc).
      const last = rows.length ? rows[rows.length - 1] : null;
      const lastDate = last?.subscribed_at ? datePart(last.subscribed_at) : '';
      if (lastDate && lastDate < cutoffIso) break;
      if (!cursor || rows.length === 0) break;
    }

    const dayBuckets = new Map<
      string,
      {
        total: number;
        active: number;
        bounced: number;
        unsubscribed: number;
        unconfirmed: number;
        junk: number;
      }
    >();

    for (const day of buildRangeDates(rangeDays)) {
      dayBuckets.set(day, {
        total: 0,
        active: 0,
        bounced: 0,
        unsubscribed: 0,
        unconfirmed: 0,
        junk: 0,
      });
    }

    for (const sub of subscribers) {
      const day = datePart(sub.subscribed_at || sub.created_at || '');
      if (!day || day < cutoffIso) continue;

      const bucket =
        dayBuckets.get(day) ||
        (() => {
          const init = {
            total: 0,
            active: 0,
            bounced: 0,
            unsubscribed: 0,
            unconfirmed: 0,
            junk: 0,
          };
          dayBuckets.set(day, init);
          return init;
        })();

      bucket.total += 1;
      const status = String(sub.status || '').toLowerCase();
      if (status === 'active') bucket.active += 1;
      else if (status === 'bounced') bucket.bounced += 1;
      else if (status === 'unsubscribed') bucket.unsubscribed += 1;
      else if (status === 'unconfirmed') bucket.unconfirmed += 1;
      else if (status === 'junk') bucket.junk += 1;
    }

    const signups = Array.from(dayBuckets.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const recent = [...subscribers]
      .sort((a, b) =>
        String(b.subscribed_at || '').localeCompare(
          String(a.subscribed_at || '')
        )
      )
      .slice(0, 25)
      .map(sub => ({
        id: sub.id,
        email: sub.email,
        status: sub.status,
        subscribed_at: sub.subscribed_at,
        opens_count: safeNumber(sub.opens_count),
        clicks_count: safeNumber(sub.clicks_count),
      }));

    const payload = {
      group: groupJson.data,
      signups,
      recent,
    };

    cache = { key: cacheKey, loadedAt: Date.now(), value: payload };
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'MailerLite fetch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
