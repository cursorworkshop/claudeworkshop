'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import {
  TRACKING_STORAGE_KEY,
  type PageVisit,
  type TrackingSession,
  type UTMParams,
} from '@/lib/tracking';

type DeviceInfo = {
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  language: string;
  languages: string[];
  timezone: string;
  connectionType?: string;
};

type TrackingStorage = TrackingSession & {
  pages: PageVisit[];
  deviceInfo?: DeviceInfo;
  sentToServer?: boolean;
};

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `cw_${Math.random().toString(36).slice(2)}${Date.now()}`;
};

const readSession = (): TrackingStorage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(TRACKING_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TrackingStorage;
  } catch {
    return null;
  }
};

const writeSession = (session: TrackingStorage) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(session));
};

const getUtmFromUrl = (url: URL): UTMParams => ({
  source: url.searchParams.get('utm_source') ?? undefined,
  medium: url.searchParams.get('utm_medium') ?? undefined,
  campaign: url.searchParams.get('utm_campaign') ?? undefined,
  content: url.searchParams.get('utm_content') ?? undefined,
  term: url.searchParams.get('utm_term') ?? undefined,
  gclid: url.searchParams.get('gclid') ?? undefined,
  fbclid: url.searchParams.get('fbclid') ?? undefined,
  msclkid: url.searchParams.get('msclkid') ?? undefined,
});

const mergeUtm = (current: UTMParams | undefined, incoming: UTMParams) => {
  const merged = { ...(current ?? {}) };

  for (const key of Object.keys(incoming) as Array<keyof UTMParams>) {
    if (!merged[key] && incoming[key]) {
      merged[key] = incoming[key];
    }
  }

  return merged;
};

const getDeviceInfo = (): DeviceInfo => {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const conn = nav
    ? (nav as Navigator & { connection?: { effectiveType?: string } })
        .connection
    : null;

  return {
    screenWidth: typeof screen !== 'undefined' ? screen.width : 0,
    screenHeight: typeof screen !== 'undefined' ? screen.height : 0,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    language: nav?.language || 'unknown',
    languages: nav?.languages ? [...nav.languages] : [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connectionType: conn?.effectiveType,
  };
};

const ensureSession = (pathname: string, now: number): TrackingStorage => {
  const existing = readSession();
  if (existing?.id) {
    return existing;
  }

  const referrer =
    typeof document !== 'undefined' ? document.referrer || null : null;
  let referrerHost: string | null = null;
  if (referrer) {
    try {
      referrerHost = new URL(referrer).hostname;
    } catch {
      referrerHost = null;
    }
  }
  const url =
    typeof window !== 'undefined' ? new URL(window.location.href) : null;
  const utm = url ? getUtmFromUrl(url) : {};

  const session: TrackingStorage = {
    id: createSessionId(),
    startedAt: now,
    referrer,
    referrerHost,
    utm,
    landingPath: pathname,
    pages: [{ path: pathname, startedAt: now }],
    deviceInfo: getDeviceInfo(),
    sentToServer: false,
  };

  writeSession(session);
  return session;
};

const updateSessionForPath = (
  session: TrackingStorage,
  pathname: string,
  now: number
) => {
  const pages = [...session.pages];
  const lastPage = pages[pages.length - 1];

  if (lastPage?.path === pathname && !lastPage.endedAt) {
    return session;
  }

  if (lastPage && !lastPage.endedAt) {
    lastPage.endedAt = now;
    lastPage.durationMs = Math.max(now - lastPage.startedAt, 0);
  }

  pages.push({ path: pathname, startedAt: now });

  return {
    ...session,
    pages,
    landingPath: session.landingPath ?? pathname,
  };
};

// Send session data to server for persistent storage
const sendSessionToServer = async (session: TrackingStorage) => {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: {
          id: session.id,
          startedAt: session.startedAt,
          referrer: session.referrer,
          referrerHost: session.referrerHost,
          utm: session.utm,
          landingPath: session.landingPath,
        },
        pages: session.pages,
        deviceInfo: session.deviceInfo,
      }),
      keepalive: true,
    });
  } catch {
    // Silent fail - analytics shouldn't break the site
  }
};

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  const sendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleServerSync = useCallback((session: TrackingStorage) => {
    // Debounce server sync to avoid too many requests
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
    }

    sendTimeoutRef.current = setTimeout(() => {
      sendSessionToServer(session);
    }, 2000); // Wait 2 seconds of inactivity before syncing
  }, []);

  useEffect(() => {
    if (!pathname || typeof window === 'undefined') {
      return;
    }

    const now = Date.now();
    let session = ensureSession(pathname, now);

    if (lastPathRef.current !== pathname) {
      session = updateSessionForPath(session, pathname, now);
    }

    const url = new URL(window.location.href);
    const utm = getUtmFromUrl(url);
    session.utm = mergeUtm(session.utm, utm);
    session.landingPath = session.landingPath ?? pathname;

    // Update device info if not set
    if (!session.deviceInfo) {
      session.deviceInfo = getDeviceInfo();
    }

    writeSession(session);
    lastPathRef.current = pathname;

    // Schedule sync to server
    scheduleServerSync(session);
  }, [pathname, scheduleServerSync]);

  // Sync on page unload
  useEffect(() => {
    const handleUnload = () => {
      const session = readSession();
      if (session) {
        // Finalize current page timing
        const now = Date.now();
        const pages = [...session.pages];
        const lastPage = pages[pages.length - 1];
        if (lastPage && !lastPage.endedAt) {
          lastPage.endedAt = now;
          lastPage.durationMs = Math.max(now - lastPage.startedAt, 0);
        }

        // Use sendBeacon for reliable delivery on unload
        navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify({
            session: {
              id: session.id,
              startedAt: session.startedAt,
              referrer: session.referrer,
              referrerHost: session.referrerHost,
              utm: session.utm,
              landingPath: session.landingPath,
            },
            pages,
            deviceInfo: session.deviceInfo,
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
    };
  }, []);

  return <>{children}</>;
}
