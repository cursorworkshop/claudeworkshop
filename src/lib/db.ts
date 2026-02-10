import fs from 'fs';
import path from 'path';

import Database from 'better-sqlite3';

import {
  getReferrerHost,
  inferChannel,
  normalizeUtm,
  type AnalyticsPayload,
  type PageVisit,
} from '@/lib/tracking';

type DbInstance = Database.Database;

type AdminSummary = {
  totals: {
    submissions: number;
    uniqueSessions: number;
    avgTotalTimeMs: number;
  };
  channels: Array<{ name: string; count: number }>;
  referrers: Array<{ name: string; count: number }>;
  campaigns: Array<{
    campaign: string;
    source: string;
    medium: string;
    count: number;
  }>;
  pages: Array<{ path: string; count: number; avgTimeMs: number }>;
  recentSubmissions: Array<{
    id: number;
    sessionId: string;
    submittedAt: number;
    formType: string;
    name: string | null;
    email: string | null;
    inquiryType: string | null;
    pagePath: string | null;
    landingPath: string | null;
    totalTimeMs: number | null;
    channel: string | null;
    referrer: string | null;
    referrerHost: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    pages: Array<{ path: string; durationMs: number | null }>;
  }>;
};

let db: DbInstance | null = null;

const getDatabasePath = () =>
  process.env.ANALYTICS_DB_PATH ||
  path.join(process.cwd(), 'data', 'analytics.sqlite');

const ensureDatabase = () => {
  if (db) {
    return db;
  }

  const dbPath = getDatabasePath();
  const directory = path.dirname(dbPath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      started_at INTEGER NOT NULL,
      referrer TEXT,
      referrer_host TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      gclid TEXT,
      fbclid TEXT,
      msclkid TEXT,
      channel TEXT,
      landing_path TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      path TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      duration_ms INTEGER,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      submitted_at INTEGER NOT NULL,
      form_type TEXT NOT NULL,
      name TEXT,
      email TEXT,
      inquiry_type TEXT,
      page_path TEXT,
      total_time_ms INTEGER,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_page_visits_session
      ON page_visits(session_id);
    CREATE INDEX IF NOT EXISTS idx_form_submissions_session
      ON form_submissions(session_id);
    CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted
      ON form_submissions(submitted_at);
  `);

  return db;
};

const sanitizePages = (pages: PageVisit[]) =>
  pages
    .filter(page => typeof page.path === 'string' && page.path.length > 0)
    .map(page => ({
      path: page.path,
      startedAt: Number(page.startedAt),
      endedAt:
        typeof page.endedAt === 'number' ? Number(page.endedAt) : undefined,
      durationMs:
        typeof page.durationMs === 'number'
          ? Number(page.durationMs)
          : undefined,
    }))
    .filter(page => Number.isFinite(page.startedAt));

export const storeAnalytics = (
  payload: AnalyticsPayload,
  options?: { userAgent?: string | null }
) => {
  const dbInstance = ensureDatabase();
  const now = Date.now();

  const session = payload.session;
  const submission = payload.submission;
  const pages = sanitizePages(payload.pages ?? []);
  const utm = normalizeUtm(session.utm);
  const referrer = session.referrer ?? null;
  const referrerHost =
    session.referrerHost ?? getReferrerHost(session.referrer);
  const landingPath = session.landingPath ?? pages[0]?.path ?? null;
  const channel = inferChannel({ referrer, referrerHost, utm });

  const submittedAt =
    typeof submission.submittedAt === 'number' ? submission.submittedAt : now;
  const totalTimeMs =
    typeof submission.totalTimeMs === 'number'
      ? submission.totalTimeMs
      : pages.reduce((total, page) => total + (page.durationMs ?? 0), 0);

  const insertSession = dbInstance.prepare(`
    INSERT OR IGNORE INTO sessions (
      id,
      started_at,
      referrer,
      referrer_host,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      msclkid,
      channel,
      landing_path,
      user_agent,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSubmission = dbInstance.prepare(`
    INSERT INTO form_submissions (
      session_id,
      submitted_at,
      form_type,
      name,
      email,
      inquiry_type,
      page_path,
      total_time_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPageVisit = dbInstance.prepare(`
    INSERT INTO page_visits (
      session_id,
      path,
      started_at,
      ended_at,
      duration_ms
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const existingVisits = dbInstance
    .prepare(
      `
      SELECT COUNT(1) as count
      FROM page_visits
      WHERE session_id = ?
    `
    )
    .get(session.id) as { count: number };

  const insertAll = dbInstance.transaction(() => {
    insertSession.run(
      session.id,
      session.startedAt,
      referrer,
      referrerHost,
      utm.source,
      utm.medium,
      utm.campaign,
      utm.content,
      utm.term,
      utm.gclid,
      utm.fbclid,
      utm.msclkid,
      channel,
      landingPath,
      options?.userAgent ?? null,
      now
    );

    if (existingVisits.count === 0) {
      for (const page of pages) {
        insertPageVisit.run(
          session.id,
          page.path,
          page.startedAt,
          page.endedAt ?? null,
          page.durationMs ?? null
        );
      }
    }

    insertSubmission.run(
      session.id,
      submittedAt,
      submission.formType,
      submission.name ?? null,
      submission.email ?? null,
      submission.inquiryType ?? null,
      submission.pagePath ?? null,
      totalTimeMs
    );
  });

  insertAll();
};

export const getAdminAnalytics = (): AdminSummary => {
  const dbInstance = ensureDatabase();

  const totalsRow = dbInstance
    .prepare(
      `
      SELECT
        COUNT(*) as submissions,
        COUNT(DISTINCT session_id) as uniqueSessions,
        AVG(total_time_ms) as avgTotalTimeMs
      FROM form_submissions
    `
    )
    .get() as {
    submissions: number;
    uniqueSessions: number;
    avgTotalTimeMs: number | null;
  };

  const channels = dbInstance
    .prepare(
      `
      SELECT COALESCE(sessions.channel, 'Unknown') as name, COUNT(*) as count
      FROM form_submissions
      JOIN sessions ON sessions.id = form_submissions.session_id
      GROUP BY name
      ORDER BY count DESC
    `
    )
    .all() as Array<{ name: string; count: number }>;

  const referrers = dbInstance
    .prepare(
      `
      SELECT
        COALESCE(sessions.referrer_host, 'Direct') as name,
        COUNT(*) as count
      FROM form_submissions
      JOIN sessions ON sessions.id = form_submissions.session_id
      GROUP BY name
      ORDER BY count DESC
    `
    )
    .all() as Array<{ name: string; count: number }>;

  const campaigns = dbInstance
    .prepare(
      `
      SELECT
        COALESCE(sessions.utm_campaign, 'n/a') as campaign,
        COALESCE(sessions.utm_source, 'n/a') as source,
        COALESCE(sessions.utm_medium, 'n/a') as medium,
        COUNT(*) as count
      FROM form_submissions
      JOIN sessions ON sessions.id = form_submissions.session_id
      WHERE
        sessions.utm_campaign IS NOT NULL
        OR sessions.utm_source IS NOT NULL
        OR sessions.utm_medium IS NOT NULL
      GROUP BY campaign, source, medium
      ORDER BY count DESC
      LIMIT 20
    `
    )
    .all() as Array<{
    campaign: string;
    source: string;
    medium: string;
    count: number;
  }>;

  const pages = dbInstance
    .prepare(
      `
      SELECT
        page_visits.path as path,
        COUNT(*) as count,
        AVG(page_visits.duration_ms) as avgTimeMs
      FROM page_visits
      JOIN form_submissions ON form_submissions.session_id = page_visits.session_id
      GROUP BY page_visits.path
      ORDER BY count DESC
      LIMIT 20
    `
    )
    .all() as Array<{ path: string; count: number; avgTimeMs: number | null }>;

  const recent = dbInstance
    .prepare(
      `
      SELECT
        form_submissions.id as id,
        form_submissions.session_id as sessionId,
        form_submissions.submitted_at as submittedAt,
        form_submissions.form_type as formType,
        form_submissions.name as name,
        form_submissions.email as email,
        form_submissions.inquiry_type as inquiryType,
        form_submissions.page_path as pagePath,
        form_submissions.total_time_ms as totalTimeMs,
        sessions.channel as channel,
        sessions.referrer as referrer,
        sessions.referrer_host as referrerHost,
        sessions.landing_path as landingPath,
        sessions.utm_source as utmSource,
        sessions.utm_medium as utmMedium,
        sessions.utm_campaign as utmCampaign
      FROM form_submissions
      JOIN sessions ON sessions.id = form_submissions.session_id
      ORDER BY form_submissions.submitted_at DESC
      LIMIT 20
    `
    )
    .all() as Array<{
    id: number;
    sessionId: string;
    submittedAt: number;
    formType: string;
    name: string | null;
    email: string | null;
    inquiryType: string | null;
    pagePath: string | null;
    landingPath: string | null;
    totalTimeMs: number | null;
    channel: string | null;
    referrer: string | null;
    referrerHost: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  }>;

  const sessionIds = recent.map(item => item.sessionId);
  const pageVisitsMap = new Map<
    string,
    Array<{ path: string; durationMs: number | null }>
  >();

  if (sessionIds.length > 0) {
    const placeholders = sessionIds.map(() => '?').join(',');
    const pageVisits = dbInstance
      .prepare(
        `
        SELECT
          session_id as sessionId,
          path,
          duration_ms as durationMs
        FROM page_visits
        WHERE session_id IN (${placeholders})
        ORDER BY started_at ASC
      `
      )
      .all(...sessionIds) as Array<{
      sessionId: string;
      path: string;
      durationMs: number | null;
    }>;

    for (const visit of pageVisits) {
      const existing = pageVisitsMap.get(visit.sessionId) ?? [];
      existing.push({ path: visit.path, durationMs: visit.durationMs });
      pageVisitsMap.set(visit.sessionId, existing);
    }
  }

  return {
    totals: {
      submissions: totalsRow?.submissions ?? 0,
      uniqueSessions: totalsRow?.uniqueSessions ?? 0,
      avgTotalTimeMs: totalsRow?.avgTotalTimeMs ?? 0,
    },
    channels,
    referrers,
    campaigns,
    pages: pages.map(page => ({
      path: page.path,
      count: page.count,
      avgTimeMs: page.avgTimeMs ?? 0,
    })),
    recentSubmissions: recent.map(item => ({
      ...item,
      pages: pageVisitsMap.get(item.sessionId) ?? [],
    })),
  };
};
