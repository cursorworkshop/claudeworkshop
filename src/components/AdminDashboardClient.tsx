'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Archive, RotateCcw, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AdminAnalytics = {
  totals: {
    sessions: number;
    pageViews: number;
    formSubmissions: number;
    leads: number;
    avgSessionTimeMs: number;
    avgSessionDurationMs?: number;
    bounceRate?: number;
    botSessions?: number;
    engagedSessions?: number;
    pagesPerSession?: number;
    paidTrafficSessions?: number;
    pageViewDurationCoverage?: number;
  };
  channels: Array<{ name: string; count: number }>;
  referrers: Array<{ name: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
  pages: Array<{
    path: string;
    count: number;
    avgTimeMs: number;
    avgScrollPercent?: number;
    exitRate?: number;
    engagementRate?: number;
  }>;
  browsers?: Array<{ name: string; count: number }>;
  operatingSystems?: Array<{ name: string; count: number }>;
  utmCampaigns?: Array<{ name: string; count: number }>;
  utmSources?: Array<{ name: string; count: number }>;
  utmMediums?: Array<{ name: string; count: number }>;
  utmContents?: Array<{ name: string; count: number }>;
  utmTerms?: Array<{ name: string; count: number }>;
  ads?: Array<{ name: string; count: number }>;
  landingPages?: Array<{ name: string; count: number }>;
  exitPages?: Array<{ name: string; count: number }>;
  aiReferrers?: Array<{ name: string; count: number }>;
  dailyStats?: Array<{ date: string; sessions: number; pageViews: number }>;
  hourlyStats?: Array<{ hour: number; sessions: number }>;
  timeDistribution?: Array<{ name: string; count: number }>;
  scrollDistribution?: Array<{ name: string; count: number }>;
  entryExitFlows?: Array<{ name: string; count: number }>;
  recentSubmissions: Array<{
    id: string;
    submitted_at: string;
    form_type: string;
    submitter_name: string | null;
    submitter_email: string | null;
    inquiry_type: string | null;
    form_page: string | null;
    landing_page: string | null;
    time_to_submit_ms: number | null;
    channel: string | null;
    referrer_host: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    device_type: string | null;
    country: string | null;
    pages_before_submit: number | null;
  }>;
  recentLeads?: Array<{
    id: string;
    email: string;
    source: string;
    channel: string | null;
    created_at: string;
  }>;
  campaignPerformance?: Array<{
    campaign: string;
    sessions: number;
    formSubs: number;
    leads: number;
    formConvRate: number;
    leadConvRate: number;
  }>;
  leadsPerChannel?: Array<{ name: string; count: number }>;
  warning?: string;
};

const CHART_COLORS = [
  '#14b8a6',
  '#3b82f6',
  '#ec4899',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#10b981',
  '#0ea5e9',
];

const formatDuration = (ms?: number | null) => {
  if (!ms || ms <= 0) return '0s';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatShortDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

export function AdminDashboardClient() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showArchivedLeads, setShowArchivedLeads] = useState(false);
  const [archivedLeads, setArchivedLeads] = useState<
    Array<{
      id: string;
      email: string;
      source: string;
      channel: string | null;
      created_at: string;
    }>
  >([]);
  const [archiveLoading, setArchiveLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setStatus('loading');
    setError('');
    setWarning('');

    try {
      const response = await fetch('/api/admin/data', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics data');
      }

      const body = (await response.json()) as {
        data: AdminAnalytics;
        warning?: string;
      };
      setData(body.data);
      if (body.warning) setWarning(body.warning);
      setStatus('ready');
    } catch (fetchError) {
      setStatus('error');
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load analytics data'
      );
    }
  }, []);

  const loadArchivedLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/leads?archived=true', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const body = await response.json();
        setArchivedLeads(body.leads || []);
      }
    } catch (e) {
      console.error('Failed to load archived leads:', e);
    }
  }, []);

  const handleArchiveLead = async (id: string, archive: boolean) => {
    setArchiveLoading(id);
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, archived: archive }),
      });
      if (response.ok) {
        // Refresh both data sources
        await loadData();
        await loadArchivedLeads();
      }
    } catch (e) {
      console.error('Failed to archive lead:', e);
    } finally {
      setArchiveLoading(null);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (showArchivedLeads) {
      loadArchivedLeads();
    }
  }, [showArchivedLeads, loadArchivedLeads]);

  if (status === 'loading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading analytics...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (status === 'error' || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unable to load analytics</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>{error}</p>
          <Button onClick={loadData}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  // Use the pre-calculated pages per session from the backend
  const pagesPerSession = data.totals.pagesPerSession?.toFixed(1) || '0';

  // Calculate engagement rate
  const engagementRate =
    data.totals.sessions > 0
      ? (
          ((data.totals.engagedSessions || 0) / data.totals.sessions) *
          100
        ).toFixed(1)
      : '0';

  return (
    <div className='flex flex-col gap-6'>
      {warning && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800'>
          {warning}
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          Last updated {new Date().toLocaleTimeString()}
        </div>
        <Button variant='outline' size='sm' onClick={loadData}>
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='traffic'>Traffic</TabsTrigger>
          <TabsTrigger value='pages'>Pages</TabsTrigger>
          <TabsTrigger value='tech'>Tech</TabsTrigger>
          <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
          <TabsTrigger value='conversions'>Conversions</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value='overview' className='space-y-6 mt-6'>
          {/* Key Metrics Row 1 */}
          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.sessions.toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Human sessions (bots filtered)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Page Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.pageViews.toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {pagesPerSession} pages/session
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Bounce Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.bounceRate || 0}%
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Single page sessions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Avg. Time/Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {formatDuration(data.totals.avgSessionTimeMs)}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Per page view (coverage{' '}
                  {data.totals.pageViewDurationCoverage ?? 0}%)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Row 2 - Engagement & Visitors */}
          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Engaged Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-green-600'>
                  {data.totals.engagedSessions || 0}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {engagementRate}% engagement rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Avg. Session Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {formatDuration(data.totals.avgSessionDurationMs)}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Per visitor session
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Bots filtered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-red-500'>
                  {(data.totals.botSessions || 0).toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Excluded from metrics
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Paid sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {(data.totals.paidTrafficSessions || 0).toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  UTM/click-id detected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Row 3 - Conversions */}
          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Lead Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-primary'>
                  {data.totals.leads || 0}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {data.totals.sessions > 0
                    ? (
                        ((data.totals.leads || 0) / data.totals.sessions) *
                        100
                      ).toFixed(2)
                    : 0}
                  % conversion
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Form Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.formSubmissions}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {data.totals.sessions > 0
                    ? (
                        (data.totals.formSubmissions / data.totals.sessions) *
                        100
                      ).toFixed(2)
                    : 0}
                  % conversion
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Lead Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.sessions > 0
                    ? (
                        ((data.totals.leads || 0) / data.totals.sessions) *
                        100
                      ).toFixed(2)
                    : 0}
                  %
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Exit intent popup
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Form Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.sessions > 0
                    ? (
                        (data.totals.formSubmissions / data.totals.sessions) *
                        100
                      ).toFixed(2)
                    : 0}
                  %
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Contact form
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Sessions */}
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-medium'>All Sessions</span>
                    <span className='text-lg font-bold'>
                      {data.totals.sessions.toLocaleString()}
                    </span>
                  </div>
                  <div className='h-3 bg-zinc-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-zinc-800 rounded-full'
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                {/* Engaged Sessions */}
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-medium'>
                      Engaged Sessions
                    </span>
                    <span className='text-lg font-bold text-green-600'>
                      {(data.totals.engagedSessions || 0).toLocaleString()}
                      <span className='text-xs font-normal text-muted-foreground ml-2'>
                        ({engagementRate}%)
                      </span>
                    </span>
                  </div>
                  <div className='h-3 bg-zinc-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-green-500 rounded-full'
                      style={{
                        width: `${data.totals.sessions > 0 ? ((data.totals.engagedSessions || 0) / data.totals.sessions) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                {/* Lead Signups */}
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-medium'>
                      Lead Signups (Exit Intent)
                    </span>
                    <span className='text-lg font-bold text-blue-600'>
                      {(data.totals.leads || 0).toLocaleString()}
                      <span className='text-xs font-normal text-muted-foreground ml-2'>
                        (
                        {data.totals.sessions > 0
                          ? (
                              ((data.totals.leads || 0) /
                                data.totals.sessions) *
                              100
                            ).toFixed(2)
                          : 0}
                        %)
                      </span>
                    </span>
                  </div>
                  <div className='h-3 bg-zinc-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-blue-500 rounded-full'
                      style={{
                        width: `${data.totals.sessions > 0 ? Math.max(((data.totals.leads || 0) / data.totals.sessions) * 100, 1) : 0}%`,
                      }}
                    />
                  </div>
                </div>
                {/* Form Submissions */}
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm font-medium'>
                      Contact Form Submissions
                    </span>
                    <span className='text-lg font-bold text-primary'>
                      {data.totals.formSubmissions.toLocaleString()}
                      <span className='text-xs font-normal text-muted-foreground ml-2'>
                        (
                        {data.totals.sessions > 0
                          ? (
                              (data.totals.formSubmissions /
                                data.totals.sessions) *
                              100
                            ).toFixed(2)
                          : 0}
                        %)
                      </span>
                    </span>
                  </div>
                  <div className='h-3 bg-zinc-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary rounded-full'
                      style={{
                        width: `${data.totals.sessions > 0 ? Math.max((data.totals.formSubmissions / data.totals.sessions) * 100, 1) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot vs Human Traffic */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Traffic Quality: Humans vs Bots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium'>Human Sessions</span>
                    <span className='text-2xl font-bold text-primary'>
                      {data.totals.sessions.toLocaleString()}
                    </span>
                  </div>
                  <div className='h-4 bg-zinc-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary rounded-full transition-all'
                      style={{
                        width: `${
                          data.totals.sessions +
                            (data.totals.botSessions || 0) >
                          0
                            ? (data.totals.sessions /
                                (data.totals.sessions +
                                  (data.totals.botSessions || 0))) *
                              100
                            : 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {data.totals.sessions + (data.totals.botSessions || 0) > 0
                      ? (
                          (data.totals.sessions /
                            (data.totals.sessions +
                              (data.totals.botSessions || 0))) *
                          100
                        ).toFixed(1)
                      : 100}
                    % of all traffic
                  </p>
                </div>
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium'>Bot Sessions</span>
                    <span className='text-2xl font-bold text-red-500'>
                      {(data.totals.botSessions || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className='h-4 bg-zinc-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-red-500 rounded-full transition-all'
                      style={{
                        width: `${
                          data.totals.sessions +
                            (data.totals.botSessions || 0) >
                          0
                            ? ((data.totals.botSessions || 0) /
                                (data.totals.sessions +
                                  (data.totals.botSessions || 0))) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {data.totals.sessions + (data.totals.botSessions || 0) > 0
                      ? (
                          ((data.totals.botSessions || 0) /
                            (data.totals.sessions +
                              (data.totals.botSessions || 0))) *
                          100
                        ).toFixed(1)
                      : 0}
                    % filtered out
                  </p>
                </div>
              </div>
              <div className='mt-4 pt-4 border-t'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>
                    Total Raw Sessions
                  </span>
                  <span className='font-semibold'>
                    {(
                      data.totals.sessions + (data.totals.botSessions || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Traffic Chart */}
          {data.dailyStats && data.dailyStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Daily Traffic (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={data.dailyStats}>
                    <defs>
                      <linearGradient
                        id='colorSessions'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#14b8a6'
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='95%'
                          stopColor='#14b8a6'
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id='colorPageViews'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#3b82f6'
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='95%'
                          stopColor='#3b82f6'
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey='date'
                      tickFormatter={formatShortDate}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      labelFormatter={label => formatShortDate(label)}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='sessions'
                      stroke='#14b8a6'
                      fillOpacity={1}
                      fill='url(#colorSessions)'
                      name='Sessions'
                    />
                    <Area
                      type='monotone'
                      dataKey='pageViews'
                      stroke='#3b82f6'
                      fillOpacity={1}
                      fill='url(#colorPageViews)'
                      name='Page Views'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Hourly Traffic + AI Referrers Row */}
          <div className='grid gap-6 lg:grid-cols-2'>
            {/* Hourly Traffic Pattern */}
            {data.hourlyStats && data.hourlyStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>
                    Traffic by Hour (UTC)
                  </CardTitle>
                </CardHeader>
                <CardContent className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={data.hourlyStats}>
                      <XAxis
                        dataKey='hour'
                        tick={{ fontSize: 10 }}
                        tickFormatter={h => `${h}:00`}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip labelFormatter={h => `${h}:00 - ${h}:59 UTC`} />
                      <Bar
                        dataKey='sessions'
                        fill='#14b8a6'
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* AI Referrers Breakdown */}
            {data.aiReferrers && data.aiReferrers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>
                    AI Traffic Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {data.aiReferrers.map((ai, i) => (
                      <div
                        key={ai.name}
                        className='flex items-center justify-between'
                      >
                        <span className='font-medium text-primary'>
                          {ai.name}
                        </span>
                        <div className='flex items-center gap-3'>
                          <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full bg-primary'
                              style={{
                                width: `${data.totals.sessions > 0 ? (ai.count / data.totals.sessions) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {ai.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Charts Row */}
          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent className='h-[280px]'>
                {data.channels.length ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.channels}
                        dataKey='count'
                        nameKey='name'
                        innerRadius={50}
                        outerRadius={90}
                      >
                        {data.channels.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No channel data yet.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Devices</CardTitle>
              </CardHeader>
              <CardContent className='h-[280px]'>
                {data.devices?.length ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.devices}
                        dataKey='count'
                        nameKey='name'
                        innerRadius={50}
                        outerRadius={90}
                      >
                        {data.devices.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No device data yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TRAFFIC TAB */}
        <TabsContent value='traffic' className='space-y-6 mt-6'>
          {/* Traffic by Channel Table - Full Detail */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Traffic by Channel (Detailed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.channels.length ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-left text-muted-foreground border-b'>
                        <th className='py-3 font-medium'>Channel</th>
                        <th className='py-3 font-medium text-right'>
                          Sessions
                        </th>
                        <th className='py-3 font-medium text-right'>Share</th>
                        <th className='py-3 font-medium text-right'>Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.channels.map((ch, i) => (
                        <tr key={ch.name} className='border-b border-border/50'>
                          <td className='py-3'>
                            <span
                              className={
                                ch.name.startsWith('AI')
                                  ? 'text-primary font-medium'
                                  : ''
                              }
                            >
                              {ch.name}
                            </span>
                          </td>
                          <td className='py-3 text-right font-semibold'>
                            {ch.count.toLocaleString()}
                          </td>
                          <td className='py-3 text-right text-muted-foreground'>
                            {data.totals.sessions > 0
                              ? (
                                  (ch.count / data.totals.sessions) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </td>
                          <td className='py-3 text-right'>
                            <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden inline-block'>
                              <div
                                className='h-full rounded-full'
                                style={{
                                  width: `${data.totals.sessions > 0 ? (ch.count / data.totals.sessions) * 100 : 0}%`,
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No channel data yet.
                </p>
              )}
            </CardContent>
          </Card>

          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Top Referrers</CardTitle>
              </CardHeader>
              <CardContent className='h-[400px]'>
                {data.referrers.length ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={data.referrers.slice(0, 15)}
                      layout='vertical'
                    >
                      <XAxis type='number' />
                      <YAxis
                        type='category'
                        dataKey='name'
                        width={140}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey='count'
                        fill={CHART_COLORS[1]}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No referrer data yet.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Top Countries</CardTitle>
              </CardHeader>
              <CardContent className='h-[400px]'>
                {data.countries?.length ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={data.countries.slice(0, 15)}
                      layout='vertical'
                    >
                      <XAxis type='number' />
                      <YAxis
                        type='category'
                        dataKey='name'
                        width={140}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey='count'
                        fill={CHART_COLORS[2]}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No country data yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PAGES TAB */}
        <TabsContent value='pages' className='space-y-6 mt-6'>
          {/* Time and Scroll Distribution */}
          <div className='grid gap-6 lg:grid-cols-2'>
            {data.timeDistribution && data.timeDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>
                    Time on Page Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={data.timeDistribution}>
                      <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey='count'
                        fill='#14b8a6'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {data.scrollDistribution && data.scrollDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>
                    Scroll Depth Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={data.scrollDistribution}>
                      <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey='count'
                        fill='#3b82f6'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Entry to Exit Flows */}
          {data.entryExitFlows && data.entryExitFlows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Top Entry → Exit Flows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.entryExitFlows.slice(0, 10).map((flow, i) => (
                    <div
                      key={flow.name}
                      className='flex items-center justify-between'
                    >
                      <span className='font-mono text-xs truncate max-w-[300px]'>
                        {flow.name}
                      </span>
                      <div className='flex items-center gap-3'>
                        <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                          <div
                            className='h-full rounded-full'
                            style={{
                              width: `${
                                data.entryExitFlows &&
                                data.entryExitFlows.length > 0
                                  ? (flow.count /
                                      data.entryExitFlows[0].count) *
                                    100
                                  : 0
                              }%`,
                              backgroundColor:
                                CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                        </div>
                        <span className='text-sm font-medium w-12 text-right'>
                          {flow.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Page Performance (Detailed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.pages.length ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-left text-muted-foreground border-b'>
                        <th className='py-3 font-medium'>Path</th>
                        <th className='py-3 font-medium text-right'>Views</th>
                        <th className='py-3 font-medium text-right'>Time</th>
                        <th className='py-3 font-medium text-right'>Scroll</th>
                        <th className='py-3 font-medium text-right'>Exit%</th>
                        <th className='py-3 font-medium text-right'>Engage%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.map(page => (
                        <tr
                          key={page.path}
                          className='border-b border-border/50'
                        >
                          <td className='py-3 font-mono text-xs max-w-[180px] truncate'>
                            {page.path}
                          </td>
                          <td className='py-3 text-right font-semibold'>
                            {page.count.toLocaleString()}
                          </td>
                          <td className='py-3 text-right text-muted-foreground'>
                            {formatDuration(page.avgTimeMs)}
                          </td>
                          <td className='py-3 text-right text-muted-foreground'>
                            {page.avgScrollPercent || 0}%
                          </td>
                          <td className='py-3 text-right text-muted-foreground'>
                            {page.exitRate || 0}%
                          </td>
                          <td className='py-3 text-right text-muted-foreground'>
                            {page.engagementRate || 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No page data yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Exit Pages */}
          {data.exitPages && data.exitPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Top Exit Pages</CardTitle>
              </CardHeader>
              <CardContent className='h-[350px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={data.exitPages.slice(0, 10)}
                    layout='vertical'
                  >
                    <XAxis type='number' />
                    <YAxis
                      type='category'
                      dataKey='name'
                      width={180}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar dataKey='count' fill='#ef4444' radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Landing Pages */}
          {data.landingPages && data.landingPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Top Landing Pages</CardTitle>
              </CardHeader>
              <CardContent className='h-[350px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={data.landingPages.slice(0, 10)}
                    layout='vertical'
                  >
                    <XAxis type='number' />
                    <YAxis
                      type='category'
                      dataKey='name'
                      width={180}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey='count'
                      fill={CHART_COLORS[4]}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TECH TAB - keeping original */}
        <TabsContent value='tech' className='space-y-6 mt-6'>
          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Browsers</CardTitle>
              </CardHeader>
              <CardContent>
                {data.browsers?.length ? (
                  <div className='space-y-3'>
                    {data.browsers.map((b, i) => (
                      <div
                        key={b.name}
                        className='flex items-center justify-between'
                      >
                        <span>{b.name}</span>
                        <div className='flex items-center gap-3'>
                          <div className='w-32 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${
                                  data.totals.sessions > 0
                                    ? (b.count / data.totals.sessions) * 100
                                    : 0
                                }%`,
                                backgroundColor:
                                  CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {b.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No browser data yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Operating Systems</CardTitle>
              </CardHeader>
              <CardContent>
                {data.operatingSystems?.length ? (
                  <div className='space-y-3'>
                    {data.operatingSystems.map((os, i) => (
                      <div
                        key={os.name}
                        className='flex items-center justify-between'
                      >
                        <span>{os.name}</span>
                        <div className='flex items-center gap-3'>
                          <div className='w-32 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${
                                  data.totals.sessions > 0
                                    ? (os.count / data.totals.sessions) * 100
                                    : 0
                                }%`,
                                backgroundColor:
                                  CHART_COLORS[(i + 2) % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {os.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No OS data yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Devices</CardTitle>
              </CardHeader>
              <CardContent>
                {data.devices?.length ? (
                  <div className='space-y-3'>
                    {data.devices.map((d, i) => (
                      <div
                        key={d.name}
                        className='flex items-center justify-between'
                      >
                        <span className='capitalize'>{d.name}</span>
                        <div className='flex items-center gap-3'>
                          <div className='w-32 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${
                                  data.totals.sessions > 0
                                    ? (d.count / data.totals.sessions) * 100
                                    : 0
                                }%`,
                                backgroundColor:
                                  CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {d.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No device data yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Countries</CardTitle>
              </CardHeader>
              <CardContent>
                {data.countries?.length ? (
                  <div className='space-y-3'>
                    {data.countries.slice(0, 10).map((c, i) => (
                      <div
                        key={c.name}
                        className='flex items-center justify-between'
                      >
                        <span>{c.name}</span>
                        <div className='flex items-center gap-3'>
                          <div className='w-32 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${
                                  data.totals.sessions > 0
                                    ? (c.count / data.totals.sessions) * 100
                                    : 0
                                }%`,
                                backgroundColor:
                                  CHART_COLORS[(i + 4) % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {c.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No country data yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CAMPAIGNS & ADS TAB */}
        <TabsContent value='campaigns' className='space-y-6 mt-6'>
          {/* Paid vs Organic Overview */}
          <Card className='bg-gradient-to-r from-zinc-50 to-white border-2'>
            <CardHeader>
              <CardTitle className='text-lg'>
                Paid vs Organic Traffic Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6 md:grid-cols-2'>
                {/* Paid Traffic */}
                <div className='p-4 rounded-lg bg-blue-50 border border-blue-200'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='w-3 h-3 rounded-full bg-blue-500' />
                    <h3 className='font-semibold text-blue-900'>
                      Paid Traffic (Google Ads, UTM)
                    </h3>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-xs text-blue-700 uppercase tracking-wide'>
                        Sessions
                      </p>
                      <p className='text-2xl font-bold text-blue-900'>
                        {(
                          data.totals.paidTrafficSessions || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-blue-700 uppercase tracking-wide'>
                        Share
                      </p>
                      <p className='text-2xl font-bold text-blue-900'>
                        {data.totals.sessions > 0
                          ? (
                              ((data.totals.paidTrafficSessions || 0) /
                                data.totals.sessions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-blue-700 uppercase tracking-wide'>
                        Unique Campaigns
                      </p>
                      <p className='text-2xl font-bold text-blue-900'>
                        {data.utmCampaigns?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-blue-700 uppercase tracking-wide'>
                        Ad Variations
                      </p>
                      <p className='text-2xl font-bold text-blue-900'>
                        {data.ads?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Organic Traffic */}
                <div className='p-4 rounded-lg bg-green-50 border border-green-200'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='w-3 h-3 rounded-full bg-green-500' />
                    <h3 className='font-semibold text-green-900'>
                      Organic Traffic
                    </h3>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-xs text-green-700 uppercase tracking-wide'>
                        Sessions
                      </p>
                      <p className='text-2xl font-bold text-green-900'>
                        {(
                          data.totals.sessions -
                          (data.totals.paidTrafficSessions || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-green-700 uppercase tracking-wide'>
                        Share
                      </p>
                      <p className='text-2xl font-bold text-green-900'>
                        {data.totals.sessions > 0
                          ? (
                              ((data.totals.sessions -
                                (data.totals.paidTrafficSessions || 0)) /
                                data.totals.sessions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-green-700 uppercase tracking-wide'>
                        Direct
                      </p>
                      <p className='text-2xl font-bold text-green-900'>
                        {data.channels.find(c => c.name === 'Direct')?.count ||
                          0}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-green-700 uppercase tracking-wide'>
                        Referrals
                      </p>
                      <p className='text-2xl font-bold text-green-900'>
                        {data.channels.find(c => c.name === 'Referral')
                          ?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Visual comparison bar */}
              <div className='mt-6'>
                <div className='flex items-center gap-4 mb-2'>
                  <span className='text-sm text-muted-foreground'>
                    Traffic Split
                  </span>
                </div>
                <div className='h-4 bg-zinc-100 rounded-full overflow-hidden flex'>
                  <div
                    className='h-full bg-blue-500'
                    style={{
                      width: `${data.totals.sessions > 0 ? ((data.totals.paidTrafficSessions || 0) / data.totals.sessions) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className='h-full bg-green-500'
                    style={{
                      width: `${data.totals.sessions > 0 ? ((data.totals.sessions - (data.totals.paidTrafficSessions || 0)) / data.totals.sessions) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className='flex justify-between mt-1 text-xs text-muted-foreground'>
                  <span>Paid</span>
                  <span>Organic</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Ads Click IDs */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Click ID Tracking (Google, Meta, LinkedIn, TikTok)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-5'>
                <div className='p-3 rounded-lg border'>
                  <p className='text-xs text-muted-foreground uppercase'>
                    Google (gclid)
                  </p>
                  <p className='text-xl font-bold'>
                    {data.ads
                      ?.filter(a => a.name.includes('gclid'))
                      .reduce((sum, a) => sum + a.count, 0) || 0}
                  </p>
                </div>
                <div className='p-3 rounded-lg border'>
                  <p className='text-xs text-muted-foreground uppercase'>
                    Meta (fbclid)
                  </p>
                  <p className='text-xl font-bold'>
                    {data.ads
                      ?.filter(a => a.name.includes('fbclid'))
                      .reduce((sum, a) => sum + a.count, 0) || 0}
                  </p>
                </div>
                <div className='p-3 rounded-lg border'>
                  <p className='text-xs text-muted-foreground uppercase'>
                    Microsoft (msclkid)
                  </p>
                  <p className='text-xl font-bold'>
                    {data.ads
                      ?.filter(a => a.name.includes('msclkid'))
                      .reduce((sum, a) => sum + a.count, 0) || 0}
                  </p>
                </div>
                <div className='p-3 rounded-lg border'>
                  <p className='text-xs text-muted-foreground uppercase'>
                    LinkedIn (li_fat_id)
                  </p>
                  <p className='text-xl font-bold'>
                    {data.ads
                      ?.filter(a => a.name.includes('li_fat_id'))
                      .reduce((sum, a) => sum + a.count, 0) || 0}
                  </p>
                </div>
                <div className='p-3 rounded-lg border'>
                  <p className='text-xs text-muted-foreground uppercase'>
                    TikTok (ttclid)
                  </p>
                  <p className='text-xl font-bold'>
                    {data.ads
                      ?.filter(a => a.name.includes('ttclid'))
                      .reduce((sum, a) => sum + a.count, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Performance with Conversions - THE KEY TABLE */}
          <Card className='border-2 border-primary/20'>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>
                Campaign Performance (with Conversions)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.campaignPerformance &&
              data.campaignPerformance.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-left text-muted-foreground border-b'>
                        <th className='py-3 font-medium'>Campaign</th>
                        <th className='py-3 font-medium text-right'>
                          Sessions
                        </th>
                        <th className='py-3 font-medium text-right'>
                          Form Subs
                        </th>
                        <th className='py-3 font-medium text-right'>
                          Conv. Rate
                        </th>
                        <th className='py-3 font-medium text-right'>
                          Performance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.campaignPerformance.map((cp, i) => (
                        <tr
                          key={cp.campaign}
                          className='border-b border-border/50'
                        >
                          <td className='py-3'>
                            <span className='font-medium text-primary'>
                              {cp.campaign}
                            </span>
                          </td>
                          <td className='py-3 text-right'>
                            {cp.sessions.toLocaleString()}
                          </td>
                          <td className='py-3 text-right font-semibold'>
                            {cp.formSubs}
                          </td>
                          <td className='py-3 text-right'>
                            <span
                              className={
                                cp.formConvRate > 2
                                  ? 'text-green-600 font-bold'
                                  : cp.formConvRate > 1
                                    ? 'text-green-600'
                                    : cp.formConvRate > 0
                                      ? 'text-yellow-600'
                                      : 'text-muted-foreground'
                              }
                            >
                              {cp.formConvRate}%
                            </span>
                          </td>
                          <td className='py-3 text-right'>
                            <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden inline-block'>
                              <div
                                className='h-full rounded-full'
                                style={{
                                  width: `${Math.min(cp.formConvRate * 20, 100)}%`,
                                  backgroundColor:
                                    cp.formConvRate > 2
                                      ? '#22c55e'
                                      : cp.formConvRate > 1
                                        ? '#84cc16'
                                        : cp.formConvRate > 0
                                          ? '#eab308'
                                          : '#d4d4d8',
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No campaign data yet. Add utm_campaign to your ad URLs.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Full Ad Breakdown - THE KEY TABLE */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Ad Performance (Source / Medium / Campaign / Content)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.ads && data.ads.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-left text-muted-foreground border-b'>
                        <th className='py-3 font-medium'>Ad Identifier</th>
                        <th className='py-3 font-medium text-right'>
                          Sessions
                        </th>
                        <th className='py-3 font-medium text-right'>Share</th>
                        <th className='py-3 font-medium text-right'>Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ads.map((ad, i) => (
                        <tr key={ad.name} className='border-b border-border/50'>
                          <td className='py-3'>
                            <span className='font-medium text-primary'>
                              {ad.name}
                            </span>
                          </td>
                          <td className='py-3 text-right font-semibold'>
                            {ad.count}
                          </td>
                          <td className='py-3 text-right text-muted-foreground'>
                            {data.totals.paidTrafficSessions &&
                            data.totals.paidTrafficSessions > 0
                              ? (
                                  (ad.count / data.totals.paidTrafficSessions) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </td>
                          <td className='py-3 text-right'>
                            <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden inline-block'>
                              <div
                                className='h-full rounded-full'
                                style={{
                                  width: `${
                                    data.ads && data.ads.length > 0
                                      ? (ad.count / data.ads[0].count) * 100
                                      : 0
                                  }%`,
                                  backgroundColor:
                                    CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No ad traffic yet. Use UTM parameters or run Google/Meta ads.
                </p>
              )}
            </CardContent>
          </Card>

          {/* UTM Breakdown Grid */}
          <div className='grid gap-6 lg:grid-cols-2'>
            {/* UTM Sources */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Traffic Sources (utm_source)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.utmSources && data.utmSources.length > 0 ? (
                  <div className='space-y-3'>
                    {data.utmSources.slice(0, 10).map((s, i) => (
                      <div
                        key={s.name}
                        className='flex items-center justify-between'
                      >
                        <span className='font-medium'>{s.name}</span>
                        <div className='flex items-center gap-3'>
                          <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${
                                  data.utmSources && data.utmSources.length > 0
                                    ? (s.count / data.utmSources[0].count) * 100
                                    : 0
                                }%`,
                                backgroundColor:
                                  CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {s.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No source data yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* UTM Mediums */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Traffic Mediums (utm_medium)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.utmMediums && data.utmMediums.length > 0 ? (
                  <div className='space-y-3'>
                    {data.utmMediums.slice(0, 10).map((m, i) => (
                      <div
                        key={m.name}
                        className='flex items-center justify-between'
                      >
                        <span className='font-medium'>{m.name}</span>
                        <div className='flex items-center gap-3'>
                          <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${
                                  data.utmMediums && data.utmMediums.length > 0
                                    ? (m.count / data.utmMediums[0].count) * 100
                                    : 0
                                }%`,
                                backgroundColor:
                                  CHART_COLORS[(i + 2) % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {m.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No medium data yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* UTM Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Campaigns (utm_campaign)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.utmCampaigns && data.utmCampaigns.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-left text-muted-foreground border-b'>
                        <th className='py-3 font-medium'>Campaign</th>
                        <th className='py-3 font-medium text-right'>
                          Sessions
                        </th>
                        <th className='py-3 font-medium text-right'>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.utmCampaigns.map(c => (
                        <tr key={c.name} className='border-b border-border/50'>
                          <td className='py-3 font-medium'>{c.name}</td>
                          <td className='py-3 text-right font-semibold'>
                            {c.count}
                          </td>
                          <td className='py-3 text-right text-muted-foreground'>
                            {data.totals.sessions > 0
                              ? (
                                  (c.count / data.totals.sessions) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No UTM campaign data yet. Add ?utm_campaign=xxx to your URLs.
                </p>
              )}
            </CardContent>
          </Card>

          {/* UTM Content & Terms */}
          <div className='grid gap-6 lg:grid-cols-2'>
            {/* UTM Content (Ad creatives) */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Ad Content (utm_content)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.utmContents && data.utmContents.length > 0 ? (
                  <div className='space-y-3'>
                    {data.utmContents.slice(0, 10).map((c, i) => (
                      <div
                        key={c.name}
                        className='flex items-center justify-between'
                      >
                        <span className='font-medium truncate max-w-[200px]'>
                          {c.name}
                        </span>
                        <div className='flex items-center gap-3'>
                          <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${
                                  data.utmContents &&
                                  data.utmContents.length > 0
                                    ? (c.count / data.utmContents[0].count) *
                                      100
                                    : 0
                                }%`,
                                backgroundColor:
                                  CHART_COLORS[(i + 4) % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {c.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No content data yet. Use utm_content to track ad variations.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* UTM Terms (Keywords) */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Keywords (utm_term)</CardTitle>
              </CardHeader>
              <CardContent>
                {data.utmTerms && data.utmTerms.length > 0 ? (
                  <div className='space-y-3'>
                    {data.utmTerms.slice(0, 10).map((t, i) => (
                      <div
                        key={t.name}
                        className='flex items-center justify-between'
                      >
                        <span className='font-medium truncate max-w-[200px]'>
                          {t.name}
                        </span>
                        <div className='flex items-center gap-3'>
                          <div className='w-24 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${
                                  data.utmTerms && data.utmTerms.length > 0
                                    ? (t.count / data.utmTerms[0].count) * 100
                                    : 0
                                }%`,
                                backgroundColor:
                                  CHART_COLORS[(i + 6) % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className='text-sm font-medium w-12 text-right'>
                            {t.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No keyword data yet. Use utm_term for paid search keywords.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CONVERSIONS TAB */}
        <TabsContent value='conversions' className='space-y-6 mt-6'>
          {/* Conversion Metrics */}
          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Lead Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-primary'>
                  {data.totals.leads || 0}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Exit intent cheat sheet
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Form Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.formSubmissions}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Contact form
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Lead Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.sessions > 0
                    ? (
                        ((data.totals.leads || 0) / data.totals.sessions) *
                        100
                      ).toFixed(2)
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  Form Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>
                  {data.totals.sessions > 0
                    ? (
                        (data.totals.formSubmissions / data.totals.sessions) *
                        100
                      ).toFixed(2)
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Leads */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-base'>
                {showArchivedLeads
                  ? 'Archived Lead Signups'
                  : 'Recent Lead Signups (Exit Intent)'}
              </CardTitle>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowArchivedLeads(!showArchivedLeads)}
                className='gap-2'
              >
                {showArchivedLeads ? (
                  <>
                    <Eye className='w-4 h-4' />
                    Show Active
                  </>
                ) : (
                  <>
                    <EyeOff className='w-4 h-4' />
                    Show Archived
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {showArchivedLeads ? (
                // Archived leads view
                archivedLeads.length > 0 ? (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='text-left text-muted-foreground border-b'>
                          <th className='py-3 font-medium'>Email</th>
                          <th className='py-3 font-medium'>Source</th>
                          <th className='py-3 font-medium'>Channel</th>
                          <th className='py-3 font-medium text-right'>Date</th>
                          <th className='py-3 font-medium text-right'>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedLeads.map(lead => (
                          <tr
                            key={lead.id}
                            className='border-b border-border/50 opacity-60'
                          >
                            <td className='py-3 font-medium'>{lead.email}</td>
                            <td className='py-3 text-muted-foreground'>
                              {lead.source}
                            </td>
                            <td className='py-3'>
                              <span
                                className={
                                  lead.channel?.startsWith('AI')
                                    ? 'text-primary font-medium'
                                    : ''
                                }
                              >
                                {lead.channel || 'Unknown'}
                              </span>
                            </td>
                            <td className='py-3 text-right text-muted-foreground'>
                              {formatDate(lead.created_at)}
                            </td>
                            <td className='py-3 text-right'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleArchiveLead(lead.id, false)
                                }
                                disabled={archiveLoading === lead.id}
                                className='gap-1 text-xs'
                              >
                                <RotateCcw className='w-3 h-3' />
                                Restore
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No archived leads.
                  </p>
                )
              ) : // Active leads view
              data.recentLeads && data.recentLeads.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-left text-muted-foreground border-b'>
                        <th className='py-3 font-medium'>Email</th>
                        <th className='py-3 font-medium'>Source</th>
                        <th className='py-3 font-medium'>Channel</th>
                        <th className='py-3 font-medium text-right'>Date</th>
                        <th className='py-3 font-medium text-right'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentLeads.slice(0, 20).map(lead => (
                        <tr key={lead.id} className='border-b border-border/50'>
                          <td className='py-3 font-medium'>{lead.email}</td>
                          <td className='py-3 text-muted-foreground'>
                            {lead.source}
                          </td>
                          <td className='py-3'>
                            <span
                              className={
                                lead.channel?.startsWith('AI')
                                  ? 'text-primary font-medium'
                                  : ''
                              }
                            >
                              {lead.channel || 'Unknown'}
                            </span>
                          </td>
                          <td className='py-3 text-right text-muted-foreground'>
                            {formatDate(lead.created_at)}
                          </td>
                          <td className='py-3 text-right'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleArchiveLead(lead.id, true)}
                              disabled={archiveLoading === lead.id}
                              className='gap-1 text-xs text-muted-foreground hover:text-foreground'
                            >
                              <Archive className='w-3 h-3' />
                              Archive
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No lead signups yet. The exit intent modal will capture emails
                  here.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Form Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Recent Form Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {data.recentSubmissions.length ? (
                data.recentSubmissions.slice(0, 10).map(sub => (
                  <div
                    key={sub.id}
                    className='rounded-lg border border-border/60 bg-muted/30 p-4'
                  >
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                      <div>
                        <div className='text-sm text-muted-foreground'>
                          {formatDate(sub.submitted_at)}
                        </div>
                        <div className='text-lg font-semibold'>
                          {sub.submitter_name || 'Anonymous'}{' '}
                          <span className='text-sm font-normal text-muted-foreground'>
                            ({sub.submitter_email || 'no email'})
                          </span>
                        </div>
                      </div>
                      <div className='text-right text-sm'>
                        <div className='font-medium'>
                          {formatDuration(sub.time_to_submit_ms)}
                        </div>
                        <div className='text-muted-foreground'>
                          {sub.pages_before_submit || 0} pages
                        </div>
                      </div>
                    </div>
                    <div className='mt-3 grid gap-2 text-sm md:grid-cols-3'>
                      <div>
                        <span className='font-medium'>Channel:</span>{' '}
                        <span
                          className={
                            sub.channel?.startsWith('AI')
                              ? 'text-primary font-semibold'
                              : ''
                          }
                        >
                          {sub.channel || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className='font-medium'>Referrer:</span>{' '}
                        {sub.referrer_host || 'Direct'}
                      </div>
                      <div>
                        <span className='font-medium'>Device:</span>{' '}
                        {sub.device_type || 'Unknown'}
                      </div>
                      <div>
                        <span className='font-medium'>Country:</span>{' '}
                        {sub.country || 'Unknown'}
                      </div>
                      <div>
                        <span className='font-medium'>Landing:</span>{' '}
                        <span className='font-mono text-xs'>
                          {sub.landing_page || 'n/a'}
                        </span>
                      </div>
                      <div>
                        <span className='font-medium'>Form:</span>{' '}
                        <span className='font-mono text-xs'>
                          {sub.form_page || 'n/a'}
                        </span>
                      </div>
                      {sub.utm_campaign && (
                        <div className='md:col-span-3'>
                          <span className='font-medium'>Campaign:</span>{' '}
                          {sub.utm_source}/{sub.utm_medium}/{sub.utm_campaign}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No submissions yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
