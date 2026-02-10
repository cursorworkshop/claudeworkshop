import 'server-only';

import {
  createServerClient,
  type AnalyticsEvent,
  type AnalyticsFormSubmission,
  type AnalyticsPageView,
  type AnalyticsSession,
} from './supabase';
import { inferChannel, normalizeUtm, getReferrerHost } from './tracking';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// Store a new session
export const storeSession = async (session: AnalyticsSession) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping session storage');
    return null;
  }

  const supabase = createServerClient();

  // Infer channel from session data
  const channel = inferChannel({
    referrer: session.referrer,
    referrerHost: session.referrer_host,
    utm: {
      source: session.utm_source,
      medium: session.utm_medium,
      campaign: session.utm_campaign,
      gclid: session.gclid,
      fbclid: session.fbclid,
      msclkid: session.msclkid,
    },
  });

  const { data, error } = await supabase
    .from('analytics_sessions')
    .upsert(
      {
        ...session,
        channel,
        referrer_host:
          session.referrer_host || getReferrerHost(session.referrer),
      },
      { onConflict: 'session_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error storing session:', error);
    return null;
  }

  return data;
};

// Store a page view
export const storePageView = async (pageView: AnalyticsPageView) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('analytics_page_views')
    .insert(pageView)
    .select()
    .single();

  if (error) {
    console.error('Error storing page view:', error);
    return null;
  }

  return data;
};

// Store an event
export const storeEvent = async (event: AnalyticsEvent) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('analytics_events')
    .insert(event)
    .select()
    .single();

  if (error) {
    console.error('Error storing event:', error);
    return null;
  }

  return data;
};

// Store a form submission with full attribution
export const storeFormSubmission = async (
  submission: Omit<AnalyticsFormSubmission, 'id'>
) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerClient();

  // Also store as an event
  const eventData = await storeEvent({
    session_id: submission.session_id,
    event_name: 'form_submit',
    event_category: 'conversion',
    event_data: {
      form_type: submission.form_type,
      form_page: submission.form_page,
    },
    form_name: submission.form_type,
  });

  const { data, error } = await supabase
    .from('analytics_form_submissions')
    .insert({
      ...submission,
      event_id: eventData?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error storing form submission:', error);
    return null;
  }

  return data;
};

// Get admin analytics summary with proper counting (avoids 1000 row limit)
export const getAnalyticsSummary = async (days = 30) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  // Use count queries to get accurate totals (avoids 1000 row limit)
  const { count: sessionCount } = await supabase
    .from('analytics_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('started_at', startDateStr)
    .eq('is_bot', false);

  // Count bot sessions separately
  const { count: botSessionCount } = await supabase
    .from('analytics_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('started_at', startDateStr)
    .eq('is_bot', true);

  const { count: formSubmissionCount } = await supabase
    .from('analytics_form_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('submitted_at', startDateStr);

  // Get lead signups count (exit intent)
  // Note: archived column may not exist yet, so we don't filter by it here
  const { count: leadCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDateStr);

  // Fetch full datasets (paginated) for factual aggregation.
  // Note: analytics ingestion can resend the same page list multiple times.
  // We dedupe page views by (session_id, path, started_at) and keep the largest duration.
  const PAGE_SIZE = 1000;

  type SessionRow = {
    session_id: string;
    started_at: string;
    last_activity_at: string;
    channel: string | null;
    referrer_host: string | null;
    referrer: string | null;
    device_type: string | null;
    country: string | null;
    browser: string | null;
    os: string | null;
    landing_page: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    gclid: string | null;
    fbclid: string | null;
    msclkid: string | null;
    li_fat_id: string | null;
    ttclid: string | null;
  };

  type PageViewRow = {
    session_id: string;
    path: string;
    started_at: string;
    duration_ms: number | null;
  };

  const fetchAll = async <T>(
    fetchPage: (
      from: number,
      to: number
    ) => Promise<{
      data: T[] | null;
      error: unknown;
    }>
  ) => {
    const rows: T[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      if (data?.length) rows.push(...data);
      if (!data || data.length < PAGE_SIZE) break;
    }
    return rows;
  };

  const sessions = await fetchAll<SessionRow>(async (from, to) => {
    const result = await supabase
      .from('analytics_sessions')
      .select(
        'session_id, started_at, last_activity_at, channel, referrer_host, referrer, device_type, country, browser, os, landing_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid, msclkid, li_fat_id, ttclid'
      )
      .gte('started_at', startDateStr)
      .eq('is_bot', false)
      .order('started_at', { ascending: false })
      .range(from, to);
    return { data: result.data as SessionRow[] | null, error: result.error };
  });

  // Create a set of valid (non-bot) session IDs for filtering page views
  const validSessionIds = new Set(sessions.map(s => s.session_id));

  const allPageViews = await fetchAll<PageViewRow>(async (from, to) => {
    const result = await supabase
      .from('analytics_page_views')
      .select('session_id, path, started_at, duration_ms')
      .gte('started_at', startDateStr)
      .order('started_at', { ascending: false })
      .range(from, to);
    return { data: result.data as PageViewRow[] | null, error: result.error };
  });

  // Dedupe page views (also filters bot sessions)
  const dedupedPageViewsMap = new Map<string, PageViewRow>();
  for (const pv of allPageViews) {
    if (!validSessionIds.has(pv.session_id)) continue;
    const key = `${pv.session_id}||${pv.path}||${pv.started_at}`;
    const existing = dedupedPageViewsMap.get(key);
    if (!existing) {
      dedupedPageViewsMap.set(key, pv);
      continue;
    }

    const existingDuration =
      typeof existing.duration_ms === 'number' ? existing.duration_ms : -1;
    const incomingDuration =
      typeof pv.duration_ms === 'number' ? pv.duration_ms : -1;

    if (incomingDuration > existingDuration) {
      dedupedPageViewsMap.set(key, pv);
    }
  }

  const pageViews = Array.from(dedupedPageViewsMap.values());

  // Get form submissions with details
  const { data: formSubmissions } = await supabase
    .from('analytics_form_submissions')
    .select('*')
    .gte('submitted_at', startDateStr)
    .order('submitted_at', { ascending: false })
    .limit(50);

  // Get ALL form submissions for campaign performance (need full count per campaign)
  const { data: allFormSubmissions } = await supabase
    .from('analytics_form_submissions')
    .select('utm_source, utm_medium, utm_campaign, channel')
    .gte('submitted_at', startDateStr);

  // Get ALL leads for campaign performance
  const { data: allLeads } = await supabase
    .from('leads')
    .select('source, channel, created_at')
    .gte('created_at', startDateStr);

  // Get recent leads
  // Note: archived column filtering is handled client-side after migration is run
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: false })
    .limit(50);

  // Aggregate channel data
  const channelCounts: Record<string, number> = {};
  const referrerCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const browserCounts: Record<string, number> = {};
  const osCounts: Record<string, number> = {};
  const utmCampaignCounts: Record<string, number> = {};
  const utmSourceCounts: Record<string, number> = {};
  const utmMediumCounts: Record<string, number> = {};
  const utmContentCounts: Record<string, number> = {};
  const utmTermCounts: Record<string, number> = {};
  const adCounts: Record<string, number> = {}; // Full ad identifier
  const landingPageCounts: Record<string, number> = {};
  const dailySessionCounts: Record<string, number> = {};
  const hourlySessionCounts: Record<number, number> = {};
  const aiReferrerCounts: Record<string, number> = {};
  let paidTrafficSessions = 0;

  sessions.forEach(s => {
    const channel = s.channel || 'Unknown';
    const referrer = s.referrer_host || 'Direct';
    const device = s.device_type || 'Unknown';
    const country = s.country || 'Unknown';
    const browser = s.browser || 'Unknown';
    const os = s.os || 'Unknown';
    const campaign = s.utm_campaign || null;
    const source = s.utm_source || null;
    const medium = s.utm_medium || null;
    const content = s.utm_content || null;
    const term = s.utm_term || null;
    const landing = s.landing_page || '/';
    const date = s.started_at.split('T')[0];
    const hour = new Date(s.started_at).getHours();

    channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    osCounts[os] = (osCounts[os] || 0) + 1;

    // Track all UTM parameters
    if (campaign)
      utmCampaignCounts[campaign] = (utmCampaignCounts[campaign] || 0) + 1;
    if (source) utmSourceCounts[source] = (utmSourceCounts[source] || 0) + 1;
    if (medium) utmMediumCounts[medium] = (utmMediumCounts[medium] || 0) + 1;
    if (content)
      utmContentCounts[content] = (utmContentCounts[content] || 0) + 1;
    if (term) utmTermCounts[term] = (utmTermCounts[term] || 0) + 1;

    // Track full ad identifier (source/medium/campaign/content)
    const isPaidMedium = ['cpc', 'ppc', 'paid', 'paidsearch'].includes(
      (medium || '').toLowerCase()
    );
    const isPaidSession =
      channel.includes('Ads') ||
      isPaidMedium ||
      Boolean(s.gclid || s.fbclid || s.msclkid || s.li_fat_id || s.ttclid);

    if (isPaidSession) {
      paidTrafficSessions++;
      const adParts = [source, medium, campaign, content].filter(Boolean);
      if (adParts.length > 0) {
        const adId = adParts.join(' / ');
        adCounts[adId] = (adCounts[adId] || 0) + 1;
      }
      // Also track Google/Meta ads by click ID
      if (s.gclid) {
        const googleAdKey = `Google Ads${campaign ? ` (${campaign})` : ''}`;
        adCounts[googleAdKey] = (adCounts[googleAdKey] || 0) + 1;
      }
      if (s.fbclid) {
        const metaAdKey = `Meta Ads${campaign ? ` (${campaign})` : ''}`;
        adCounts[metaAdKey] = (adCounts[metaAdKey] || 0) + 1;
      }
    }

    landingPageCounts[landing] = (landingPageCounts[landing] || 0) + 1;
    dailySessionCounts[date] = (dailySessionCounts[date] || 0) + 1;
    hourlySessionCounts[hour] = (hourlySessionCounts[hour] || 0) + 1;

    // Track AI referrers separately
    if (
      channel?.startsWith('AI') ||
      referrer?.includes('chat.openai') ||
      referrer?.includes('perplexity') ||
      referrer?.includes('claude.ai')
    ) {
      let aiSource = 'Other AI';
      const ref = (s.referrer || '').toLowerCase();
      if (ref.includes('chat.openai') || ref.includes('chatgpt'))
        aiSource = 'ChatGPT';
      else if (ref.includes('perplexity')) aiSource = 'Perplexity';
      else if (ref.includes('claude.ai')) aiSource = 'Claude';
      else if (ref.includes('gemini') || ref.includes('bard'))
        aiSource = 'Gemini';
      else if (ref.includes('copilot')) aiSource = 'Copilot';
      else if (channel?.includes('ChatGPT')) aiSource = 'ChatGPT';
      else if (channel?.includes('Claude')) aiSource = 'Claude';
      else if (channel?.includes('Perplexity')) aiSource = 'Perplexity';
      aiReferrerCounts[aiSource] = (aiReferrerCounts[aiSource] || 0) + 1;
    }
  });

  // Aggregate page data
  const pageCounts: Record<
    string,
    {
      count: number;
      totalTime: number;
      totalScroll: number;
      exits: number;
      interactions: number;
    }
  > = {};
  const dailyPageViewCounts: Record<string, number> = {};
  const sessionPageCounts: Record<string, number> = {};
  const exitPageCounts: Record<string, number> = {};

  pageViews.forEach(pv => {
    const date = pv.started_at.split('T')[0];
    if (!pageCounts[pv.path]) {
      pageCounts[pv.path] = {
        count: 0,
        totalTime: 0,
        totalScroll: 0,
        exits: 0,
        interactions: 0,
      };
    }
    pageCounts[pv.path].count++;
    pageCounts[pv.path].totalTime += pv.duration_ms || 0;
    // scroll/exit/interaction are not yet reliably tracked in ingestion
    dailyPageViewCounts[date] = (dailyPageViewCounts[date] || 0) + 1;

    // Track pages per session for bounce rate
    sessionPageCounts[pv.session_id] =
      (sessionPageCounts[pv.session_id] || 0) + 1;
  });

  // Calculate bounce rate (sessions with only 1 page view)
  const totalSessionsWithPageViews = Object.keys(sessionPageCounts).length;
  const bouncedSessions = Object.values(sessionPageCounts).filter(
    c => c === 1
  ).length;
  const bounceRate =
    totalSessionsWithPageViews > 0
      ? (bouncedSessions / totalSessionsWithPageViews) * 100
      : 0;

  // Calculate averages
  const pageViewDurations = pageViews
    .map(pv => (typeof pv.duration_ms === 'number' ? pv.duration_ms : null))
    .filter((v): v is number => typeof v === 'number' && v > 0);
  const avgSessionTime =
    pageViewDurations.length > 0
      ? pageViewDurations.reduce((sum, ms) => sum + ms, 0) /
        pageViewDurations.length
      : 0;

  const pageViewDurationCoverage =
    pageViews.length > 0 ? pageViewDurations.length / pageViews.length : 0;

  // Build daily stats array for time series chart
  const dailyStats: Array<{
    date: string;
    sessions: number;
    pageViews: number;
  }> = [];
  const allDates = new Set([
    ...Object.keys(dailySessionCounts),
    ...Object.keys(dailyPageViewCounts),
  ]);
  allDates.forEach(date => {
    dailyStats.push({
      date,
      sessions: dailySessionCounts[date] || 0,
      pageViews: dailyPageViewCounts[date] || 0,
    });
  });
  dailyStats.sort((a, b) => a.date.localeCompare(b.date));

  // Build hourly stats
  const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    sessions: hourlySessionCounts[hour] || 0,
  }));

  // Calculate actual page views from filtered data (human sessions only)
  const humanPageViews = pageViews.length;

  // Calculate pages per session properly (sessions that have at least one page view)
  const pagesPerSession =
    totalSessionsWithPageViews > 0
      ? humanPageViews / totalSessionsWithPageViews
      : 0;

  // Calculate engaged sessions and average session duration (from session timestamps)
  const sessionDurations = sessions
    .map(s => {
      const startedAt = new Date(s.started_at).getTime();
      const lastActivityAt = new Date(s.last_activity_at).getTime();
      return Math.max(lastActivityAt - startedAt, 0);
    })
    .filter(ms => Number.isFinite(ms));

  const avgSessionDuration =
    sessionDurations.length > 0
      ? sessionDurations.reduce((sum, ms) => sum + ms, 0) /
        sessionDurations.length
      : 0;

  const engagedSessions = sessions.filter(s => {
    const sessionId = s.session_id;
    const pageCount = sessionPageCounts[sessionId] || 0;
    const startedAt = new Date(s.started_at).getTime();
    const lastActivityAt = new Date(s.last_activity_at).getTime();
    const durationMs = Math.max(lastActivityAt - startedAt, 0);
    return pageCount > 1 || durationMs > 10_000;
  }).length;

  // Time on page distribution
  const timeDistribution = {
    under10s: 0,
    '10to30s': 0,
    '30to60s': 0,
    '1to3min': 0,
    over3min: 0,
  };
  pageViews.forEach(pv => {
    const duration = pv.duration_ms || 0;
    if (duration < 10000) timeDistribution.under10s++;
    else if (duration < 30000) timeDistribution['10to30s']++;
    else if (duration < 60000) timeDistribution['30to60s']++;
    else if (duration < 180000) timeDistribution['1to3min']++;
    else timeDistribution.over3min++;
  });

  // Scroll depth distribution
  const scrollDistribution = {
    under25: 0,
    '25to50': 0,
    '50to75': 0,
    '75to100': 0,
  };
  // Scroll is not yet tracked reliably, keep distribution empty for now.

  // Entry to exit flow (top 10 paths)
  const entryExitFlows: Record<string, number> = {};
  const sessionLandingPages: Record<string, string> = {};
  sessions.forEach(s => {
    sessionLandingPages[s.session_id] = s.landing_page || '/';
  });
  // Exit flows require reliable exit tracking. Disabled until ingestion supports it.

  // Campaign Performance: aggregate sessions, form submissions, and leads per campaign
  const campaignPerformance: Record<
    string,
    { sessions: number; formSubs: number; leads: number }
  > = {};

  // Count sessions per campaign
  sessions.forEach(s => {
    if (s.utm_campaign) {
      if (!campaignPerformance[s.utm_campaign]) {
        campaignPerformance[s.utm_campaign] = {
          sessions: 0,
          formSubs: 0,
          leads: 0,
        };
      }
      campaignPerformance[s.utm_campaign].sessions++;
    }
  });

  // Count form submissions per campaign
  (allFormSubmissions || []).forEach(sub => {
    const campaign = sub.utm_campaign;
    if (campaign) {
      if (!campaignPerformance[campaign]) {
        campaignPerformance[campaign] = { sessions: 0, formSubs: 0, leads: 0 };
      }
      campaignPerformance[campaign].formSubs++;
    }
  });

  // Count leads per channel (leads don't have UTM directly, but have channel)
  const leadsPerChannel: Record<string, number> = {};
  (allLeads || []).forEach(lead => {
    const channel = lead.channel || 'Unknown';
    leadsPerChannel[channel] = (leadsPerChannel[channel] || 0) + 1;
  });

  // Build campaign performance array with conversion rates
  const campaignPerformanceArray = Object.entries(campaignPerformance)
    .map(([campaign, data]) => ({
      campaign,
      sessions: data.sessions,
      formSubs: data.formSubs,
      leads: data.leads,
      formConvRate:
        data.sessions > 0
          ? Math.round((data.formSubs / data.sessions) * 10000) / 100
          : 0,
      leadConvRate:
        data.sessions > 0
          ? Math.round((data.leads / data.sessions) * 10000) / 100
          : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 20);

  return {
    totals: {
      sessions: sessionCount || 0,
      botSessions: botSessionCount || 0,
      pageViews: humanPageViews,
      formSubmissions: formSubmissionCount || 0,
      leads: leadCount || 0,
      avgSessionTimeMs: avgSessionTime,
      avgSessionDurationMs: avgSessionDuration,
      bounceRate: Math.round(bounceRate * 10) / 10,
      engagedSessions,
      pagesPerSession: Math.round(pagesPerSession * 10) / 10,
      paidTrafficSessions,
      pageViewDurationCoverage:
        Math.round(pageViewDurationCoverage * 1000) / 10,
    },
    channels: Object.entries(channelCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    referrers: Object.entries(referrerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    devices: Object.entries(deviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    countries: Object.entries(countryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    pages: Object.entries(pageCounts)
      .map(([path, data]) => ({
        path,
        count: data.count,
        avgTimeMs: data.count > 0 ? data.totalTime / data.count : 0,
        avgScrollPercent:
          data.count > 0 ? Math.round(data.totalScroll / data.count) : 0,
        exitRate:
          data.count > 0 ? Math.round((data.exits / data.count) * 100) : 0,
        engagementRate:
          data.count > 0
            ? Math.round((data.interactions / data.count) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30),
    browsers: Object.entries(browserCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    operatingSystems: Object.entries(osCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    utmCampaigns: Object.entries(utmCampaignCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    utmSources: Object.entries(utmSourceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    utmMediums: Object.entries(utmMediumCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    utmContents: Object.entries(utmContentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    utmTerms: Object.entries(utmTermCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    ads: Object.entries(adCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30),
    landingPages: Object.entries(landingPageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    exitPages: Object.entries(exitPageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    aiReferrers: Object.entries(aiReferrerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    dailyStats,
    hourlyStats,
    timeDistribution: Object.entries(timeDistribution).map(([name, count]) => ({
      name:
        name === 'under10s'
          ? '<10s'
          : name === '10to30s'
            ? '10-30s'
            : name === '30to60s'
              ? '30-60s'
              : name === '1to3min'
                ? '1-3min'
                : '>3min',
      count,
    })),
    scrollDistribution: Object.entries(scrollDistribution).map(
      ([name, count]) => ({
        name:
          name === 'under25'
            ? '0-25%'
            : name === '25to50'
              ? '25-50%'
              : name === '50to75'
                ? '50-75%'
                : '75-100%',
        count,
      })
    ),
    entryExitFlows: Object.entries(entryExitFlows)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    recentSubmissions: formSubmissions || [],
    recentLeads: recentLeads || [],
    campaignPerformance: campaignPerformanceArray,
    leadsPerChannel: Object.entries(leadsPerChannel)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
};

// Get detailed session with page journey
export const getSessionDetails = async (sessionId: string) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerClient();

  const { data: session } = await supabase
    .from('analytics_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  const { data: pageViews } = await supabase
    .from('analytics_page_views')
    .select('*')
    .eq('session_id', sessionId)
    .order('started_at', { ascending: true });

  const { data: events } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  return {
    session,
    pageViews,
    events,
  };
};
