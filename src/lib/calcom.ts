import 'server-only';

type CalBooking = {
  id: number | string;
  status?: string | null;
  createdAt?: string | null;
};

type CalBookingsResponse = {
  data?: CalBooking[];
};

const DEFAULT_API_VERSION = '2024-08-13';
const DEFAULT_BASE_URL = 'https://api.cal.com';
const CACHE_TTL_MS = 30_000;

let cache: {
  key: string;
  loadedAt: number;
  value: { total: number; cancelled: number };
} | null = null;

function getConfig() {
  const apiKey = process.env.CALCOM_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    apiVersion: process.env.CALCOM_API_VERSION || DEFAULT_API_VERSION,
    baseUrl: process.env.CALCOM_API_BASE_URL || DEFAULT_BASE_URL,
  };
}

export function isCalComConfigured(): boolean {
  return Boolean(getConfig());
}

export async function fetchCalBookingsCount(options: {
  afterCreatedAt: string;
  beforeCreatedAt: string;
}): Promise<{ total: number; cancelled: number }> {
  const config = getConfig();
  if (!config) {
    return { total: 0, cancelled: 0 };
  }

  const cacheKey = `${options.afterCreatedAt}..${options.beforeCreatedAt}`;
  if (
    cache &&
    cache.key === cacheKey &&
    Date.now() - cache.loadedAt < CACHE_TTL_MS
  ) {
    return cache.value;
  }

  const take = 100;
  let skip = 0;
  let total = 0;
  let cancelled = 0;

  // Best-effort: Cal.com pagination uses (take, skip).
  for (let page = 0; page < 100; page += 1) {
    const url = new URL('/v2/bookings', config.baseUrl);
    url.searchParams.set('afterCreatedAt', options.afterCreatedAt);
    url.searchParams.set('beforeCreatedAt', options.beforeCreatedAt);
    url.searchParams.set('take', String(take));
    url.searchParams.set('skip', String(skip));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'cal-api-version': config.apiVersion,
      },
      // Avoid caching across requests; we do our own caching at the caller if needed.
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Cal.com bookings fetch failed (${response.status}): ${text.slice(0, 200)}`
      );
    }

    const json = (await response.json()) as CalBookingsResponse;
    const rows = Array.isArray(json.data) ? json.data : [];

    for (const booking of rows) {
      total += 1;
      const status = typeof booking.status === 'string' ? booking.status : '';
      if (status.toLowerCase() === 'cancelled') {
        cancelled += 1;
      }
    }

    if (rows.length < take) {
      break;
    }

    skip += take;
  }

  const value = { total, cancelled };
  cache = { key: cacheKey, loadedAt: Date.now(), value };
  return value;
}
