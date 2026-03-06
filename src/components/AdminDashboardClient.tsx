'use client';

import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ComparisonMetric = {
  current: number;
  previous: number;
  deltaPercent: number;
};

type AdminAnalytics = {
  period?: {
    days: number;
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
    compareEnabled: boolean;
  };
  totals: {
    sessions: number;
    pageViews: number;
    formSubmissions: number;
    leads: number;
    avgSessionTimeMs: number;
    avgSessionDurationMs?: number;
    bounceRate?: number;
    engagedSessions?: number;
    pagesPerSession?: number;
  };
  uniqueSessions?: {
    ever: number;
    range: number;
    dailyAverage: number;
    previousRange: number;
  };
  comparison?: {
    sessions: ComparisonMetric;
    uniqueRange: ComparisonMetric;
    leads: ComparisonMetric;
  };
  cal?: {
    url: string;
    configured: boolean;
    warning?: string | null;
    callClicks: number;
    callClicksPrevious: number;
    bookings: number;
    bookingsCancelled?: number;
    bookingsPrevious: number;
    bookingsCancelledPrevious?: number;
    clickToBookingRate: number;
    clickToBookingRatePrevious: number;
  };
  trends?: Array<{
    date: string;
    sessions: number;
    uniqueDaily: number;
    leads: number;
  }>;
  sourceMix?: Array<{ name: string; count: number }>;
  channels: Array<{ name: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
  pages: Array<{ path: string; count: number; avgTimeMs: number }>;
  campaignTable?: Array<{
    campaign: string;
    sessions: number;
    formSubs: number;
    leads: number;
    formConvRate: number;
    leadConvRate: number;
  }>;
  hourlyStats?: Array<{ hour: number; sessions: number }>;
};

type MailerLiteGroup = {
  id: string;
  name: string;
  active_count: number;
  sent_count: number;
  opens_count: number;
  open_rate?: { float?: number; string?: string };
  clicks_count: number;
  click_rate?: { float?: number; string?: string };
  unsubscribed_count: number;
  unconfirmed_count: number;
  bounced_count: number;
  junk_count: number;
  created_at: string;
};

type MailerLiteSignupsRow = {
  date: string;
  total: number;
  active: number;
  bounced: number;
  unsubscribed: number;
  unconfirmed: number;
  junk: number;
};

type MailerLiteRecentSubscriber = {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
  opens_count: number;
  clicks_count: number;
};

type MailerLiteAdminResponse = {
  group: MailerLiteGroup;
  signups: MailerLiteSignupsRow[];
  recent: MailerLiteRecentSubscriber[];
};

type OutreachStepSummary = {
  step: number;
  dayOffset: number;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
};

type OutreachLeadStep = {
  step: number;
  dayOffset: number;
  sent: boolean;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bounced: boolean;
  resendId: string | null;
};

type OutreachLead = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  source: string;
  channel: string | null;
  country?: string | null;
  createdAt: string;
  batchKey?: string;
  batchStart?: string | null;
  batchEnd?: string | null;
  archived: boolean;
  eligibleForOutreach: boolean;
  hasBounced?: boolean;
  state?: 'archived' | 'bounced' | 'completed' | 'due' | 'waiting';
  currentStep: number;
  lastSentAt?: string | null;
  nextStep: number | null;
  nextSendAt: string | null;
  nextSendIsDue: boolean;
  statusLabel: string;
  stepStatus: OutreachLeadStep[];
};

type OutreachResponse = {
  automation?: {
    paused: boolean;
    batching?: {
      enabled: boolean;
      launchCutoffIso: string;
      windowDays: number;
    };
  };
  batches?: Array<{
    key: string;
    startIso: string | null;
    endIso: string | null;
    total: number;
    due: number;
    waiting: number;
    completed: number;
    archived: number;
    bounced: number;
  }>;
  summary: {
    totalLeads: number;
    activeLeads: number;
    outreachEligibleLeads: number;
    totalSent: number;
    funnel: {
      notStarted: number;
      step1: number;
      step2: number;
      completed: number;
    };
    steps: OutreachStepSummary[];
    timeline: Array<{ date: string; sent: number; opened: number }>;
    health?: {
      sendSuccessRate: number;
      bounceRate: number;
      openRate: number;
      clickRate: number;
      overdueLeads: number;
    };
  };
  leads: OutreachLead[];
};

type OutreachTemplate = {
  step: number;
  dayOffset: number;
  subject: string;
  snippet: string;
  previewHtml: string;
  bodyHtml: string;
  isOverride?: boolean;
};

type AuditEvent = {
  id: string;
  created_at: string;
  actor: string;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
};

type NameDraft = {
  firstName: string;
  lastName: string;
};

type LeadSortColumn =
  | 'createdAt'
  | 'email'
  | 'name'
  | 'source'
  | 'channel'
  | 'country';

type SortDirection = 'asc' | 'desc' | 'none';

type CampaignSortColumn =
  | 'campaign'
  | 'sessions'
  | 'formSubs'
  | 'leads'
  | 'leadConvRate';

const RANGE_OPTIONS = [7, 30, 90] as const;
const LEAD_SOURCE_OPTIONS = [
  'white_paper_download',
  'white_paper_landing',
  'linkedin_manual',
  'google_ads_manual',
  'other_manual',
] as const;

const dateTimePartsFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const datePartsFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function formatBatchLabel(batch: {
  key: string;
  startIso: string | null;
  endIso: string | null;
}) {
  if (batch.key === 'prelaunch') return 'Batch 1 (existing)';
  if (batch.key === 'all') return 'All batches';
  if (batch.key.startsWith('w')) {
    const idx = Number(batch.key.slice(1));
    const number = Number.isFinite(idx) ? idx + 2 : 0;
    const start = formatDate(batch.startIso);
    const end = formatDate(batch.endIso);
    if (start !== '-' && end !== '-')
      return `Batch ${number} (${start} to ${end})`;
    return `Batch ${number}`;
  }
  return batch.key;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  try {
    const parts = dateTimePartsFormatter.formatToParts(date);
    const get = (type: string) =>
      parts.find(part => part.type === type)?.value || '';
    const year = get('year');
    const month = get('month');
    const day = get('day');
    const hour = get('hour');
    const minute = get('minute');
    if (year && month && day && hour && minute) {
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    return dateTimePartsFormatter.format(date);
  } catch {
    return dateTimePartsFormatter.format(date);
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  try {
    const parts = datePartsFormatter.formatToParts(date);
    const get = (type: string) =>
      parts.find(part => part.type === type)?.value || '';
    const year = get('year');
    const month = get('month');
    const day = get('day');
    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
    return datePartsFormatter.format(date);
  } catch {
    return datePartsFormatter.format(date);
  }
}

function formatTime(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return timeFormatter.format(date);
}

function formatDuration(ms?: number | null): string {
  if (!ms || ms <= 0) return '0s';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function toCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return value;
}

function deltaPercent(current: number, previous: number): number {
  if (!previous || previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function getFullName(lead: OutreachLead): string {
  return `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
}

function getDraftForLead(
  drafts: Record<string, NameDraft>,
  lead: OutreachLead
): NameDraft {
  return (
    drafts[lead.id] || {
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
    }
  );
}

function cycleSortDirection(
  currentColumn: string,
  activeColumn: string,
  currentDirection: SortDirection
): SortDirection {
  if (currentColumn !== activeColumn) return 'asc';
  if (currentDirection === 'asc') return 'desc';
  if (currentDirection === 'desc') return 'none';
  return 'asc';
}

function getTrendTone(value: number): 'good' | 'warn' | 'bad' {
  if (value > 0) return 'good';
  if (value < 0) return 'bad';
  return 'warn';
}

function getHealthClass(level: 'good' | 'warn' | 'bad') {
  if (level === 'good') return 'text-emerald-700';
  if (level === 'warn') return 'text-amber-700';
  return 'text-red-700';
}

function healthLevelForMetric(
  name: string,
  value: number
): 'good' | 'warn' | 'bad' {
  switch (name) {
    case 'sendSuccessRate':
      if (value >= 99) return 'good';
      if (value >= 97) return 'warn';
      return 'bad';
    case 'bounceRate':
      if (value <= 2) return 'good';
      if (value <= 5) return 'warn';
      return 'bad';
    case 'openRate':
      if (value >= 35) return 'good';
      if (value >= 20) return 'warn';
      return 'bad';
    case 'clickRate':
      if (value >= 3) return 'good';
      if (value >= 1) return 'warn';
      return 'bad';
    case 'overdueLeads':
      if (value <= 5) return 'good';
      if (value <= 20) return 'warn';
      return 'bad';
    default:
      return 'warn';
  }
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export function AdminDashboardClient() {
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local',
    []
  );

  const [view, setView] = useState<'analytics' | 'outreach'>('analytics');
  const [rangeDays, setRangeDays] =
    useState<(typeof RANGE_OPTIONS)[number]>(30);
  const [compareEnabled, setCompareEnabled] = useState(true);

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [analyticsWarning, setAnalyticsWarning] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');

  const [mailerLite, setMailerLite] = useState<MailerLiteAdminResponse | null>(
    null
  );
  const [mailerLiteError, setMailerLiteError] = useState('');

  const [outreach, setOutreach] = useState<OutreachResponse | null>(null);
  const [outreachError, setOutreachError] = useState('');
  const [batchKeyFilter, setBatchKeyFilter] = useState<string>('all');
  const [automationPaused, setAutomationPaused] = useState(false);
  const [savingAutomation, setSavingAutomation] = useState(false);
  const [resettingBatchCutoff, setResettingBatchCutoff] = useState(false);

  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [templatesError, setTemplatesError] = useState('');

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditCursor, setAuditCursor] = useState<string | null>(null);
  const [auditError, setAuditError] = useState('');
  const [auditLoadingMore, setAuditLoadingMore] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [leadSortColumn, setLeadSortColumn] =
    useState<LeadSortColumn>('createdAt');
  const [leadSortDirection, setLeadSortDirection] =
    useState<SortDirection>('desc');
  const [campaignSortColumn, setCampaignSortColumn] =
    useState<CampaignSortColumn>('sessions');
  const [campaignSortDirection, setCampaignSortDirection] =
    useState<SortDirection>('desc');

  const [nameDrafts, setNameDrafts] = useState<Record<string, NameDraft>>({});
  const [expandedLeadIds, setExpandedLeadIds] = useState<Set<string>>(
    () => new Set()
  );
  const [nameModalLeadId, setNameModalLeadId] = useState<string | null>(null);
  const [savingNameId, setSavingNameId] = useState<string | null>(null);
  const [updatingArchiveId, setUpdatingArchiveId] = useState<string | null>(
    null
  );
  const [deleteModalLeadId, setDeleteModalLeadId] = useState<string | null>(
    null
  );
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const [newLeadSource, setNewLeadSource] = useState<string>('linkedin_manual');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadFirstName, setNewLeadFirstName] = useState('');
  const [newLeadLastName, setNewLeadLastName] = useState('');
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const [createLeadError, setCreateLeadError] = useState('');

  const [activeTemplateStep, setActiveTemplateStep] = useState<number>(1);
  const [templateModalStep, setTemplateModalStep] = useState<number | null>(
    null
  );
  const [templateDraftSubject, setTemplateDraftSubject] = useState('');
  const [templateDraftBodyHtml, setTemplateDraftBodyHtml] = useState('');
  const [savingTemplateStep, setSavingTemplateStep] = useState<number | null>(
    null
  );
  const [templateSaveError, setTemplateSaveError] = useState('');

  const [sendModalLeadId, setSendModalLeadId] = useState<string | null>(null);
  const [sendingLeadId, setSendingLeadId] = useState<string | null>(null);
  const [sendError, setSendError] = useState('');
  const [startingLeadId, setStartingLeadId] = useState<string | null>(null);
  const [runningScheduler, setRunningScheduler] = useState(false);
  const [schedulerMessage, setSchedulerMessage] = useState('');
  const [runSchedulerModalOpen, setRunSchedulerModalOpen] = useState(false);
  const [runSchedulerConfirmError, setRunSchedulerConfirmError] = useState('');
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [launchConfirmError, setLaunchConfirmError] = useState('');
  const [launchingBatch, setLaunchingBatch] = useState(false);

  const syncNameDrafts = useCallback((leads: OutreachLead[]) => {
    setNameDrafts(prev => {
      const next = { ...prev };
      for (const lead of leads) {
        if (!next[lead.id]) {
          next[lead.id] = {
            firstName: lead.firstName || '',
            lastName: lead.lastName || '',
          };
        }
      }
      return next;
    });
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsError('');
    const response = await fetch(
      `/api/admin/data?range=${rangeDays}&compare=${compareEnabled}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, 'Failed to load analytics')
      );
    }

    const body = (await response.json()) as {
      data: AdminAnalytics;
      warning?: string;
    };

    setAnalytics(body.data);
    setAnalyticsWarning(body.warning || '');
  }, [compareEnabled, rangeDays]);

  const loadMailerLite = useCallback(async () => {
    setMailerLiteError('');

    const response = await fetch(`/api/admin/mailerlite?range=${rangeDays}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, 'Failed to load MailerLite stats')
      );
    }

    const body = (await response.json()) as MailerLiteAdminResponse;
    setMailerLite(body);
  }, [rangeDays]);

  const loadOutreach = useCallback(async () => {
    setOutreachError('');
    const response = await fetch('/api/admin/outreach', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, 'Failed to load outreach')
      );
    }

    const body = (await response.json()) as OutreachResponse;
    setOutreach(body);
    setAutomationPaused(Boolean(body.automation?.paused));
    syncNameDrafts(body.leads);
  }, [syncNameDrafts]);

  const setAutomation = async (paused: boolean) => {
    setSavingAutomation(true);
    setOutreachError('');
    try {
      const response = await fetch('/api/admin/outreach/config', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused }),
      });
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to update automation status')
        );
      }

      setAutomationPaused(paused);
      await Promise.all([loadOutreach(), loadAudit(false)]);
    } catch (error) {
      setOutreachError(
        error instanceof Error ? error.message : 'Failed to update automation'
      );
    } finally {
      setSavingAutomation(false);
    }
  };

  const resetBatchCutoffToNow = async () => {
    setResettingBatchCutoff(true);
    setOutreachError('');
    try {
      const response = await fetch('/api/admin/outreach/config', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paused: automationPaused,
          batching: {
            enabled: true,
            windowDays: 7,
            launchCutoffIso: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to update batching config')
        );
      }

      await Promise.all([loadOutreach(), loadAudit(false)]);
    } catch (error) {
      setOutreachError(
        error instanceof Error ? error.message : 'Failed to update batching'
      );
    } finally {
      setResettingBatchCutoff(false);
    }
  };

  const loadTemplates = useCallback(async () => {
    setTemplatesError('');
    const response = await fetch('/api/admin/outreach/templates', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, 'Failed to load templates')
      );
    }

    const body = (await response.json()) as { templates: OutreachTemplate[] };
    setTemplates(body.templates || []);
  }, []);

  const loadAudit = useCallback(
    async (append = false, before?: string | null) => {
      setAuditError('');
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (before) params.set('before', before);

      const response = await fetch(`/api/admin/audit?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to load audit log')
        );
      }

      const body = (await response.json()) as {
        events: AuditEvent[];
        nextCursor: string | null;
      };

      setAuditCursor(body.nextCursor || null);
      setAuditEvents(prev => {
        if (append) return [...prev, ...(body.events || [])];
        return body.events || [];
      });
    },
    []
  );

  const loadAll = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        await Promise.all([
          loadAnalytics(),
          loadMailerLite(),
          loadOutreach(),
          loadTemplates(),
          loadAudit(false),
        ]);
        setLastRefreshedAt(new Date().toISOString());
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load dashboard';
        setAnalyticsError(message);
        setMailerLiteError(message);
        setOutreachError(message);
        setTemplatesError(message);
        setAuditError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [loadAnalytics, loadAudit, loadMailerLite, loadOutreach, loadTemplates]
  );

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const leadById = useMemo(() => {
    const map = new Map<string, OutreachLead>();
    for (const lead of outreach?.leads || []) {
      map.set(lead.id, lead);
    }
    return map;
  }, [outreach?.leads]);

  const templateByStep = useMemo(() => {
    const map = new Map<number, OutreachTemplate>();
    for (const template of templates) {
      map.set(template.step, template);
    }
    return map;
  }, [templates]);

  const selectedSendLead = useMemo(() => {
    if (!sendModalLeadId) return null;
    return leadById.get(sendModalLeadId) || null;
  }, [leadById, sendModalLeadId]);

  const selectedNameLead = useMemo(() => {
    if (!nameModalLeadId) return null;
    return leadById.get(nameModalLeadId) || null;
  }, [leadById, nameModalLeadId]);

  const selectedDeleteLead = useMemo(() => {
    if (!deleteModalLeadId) return null;
    return leadById.get(deleteModalLeadId) || null;
  }, [deleteModalLeadId, leadById]);

  const filteredLeads = useMemo(() => {
    if (!outreach) return [];

    const query = search.trim().toLowerCase();
    let rows = outreach.leads.filter(lead => {
      if (!showArchived && lead.archived) return false;
      if (showArchived && !lead.archived) return false;
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;

      if (!query) return true;
      const fullName = getFullName(lead).toLowerCase();
      return (
        lead.email.toLowerCase().includes(query) ||
        lead.source.toLowerCase().includes(query) ||
        (lead.channel || '').toLowerCase().includes(query) ||
        (lead.country || '').toLowerCase().includes(query) ||
        fullName.includes(query)
      );
    });

    if (leadSortDirection === 'none') return rows;

    rows = [...rows].sort((a, b) => {
      let left: string | number | null = null;
      let right: string | number | null = null;

      switch (leadSortColumn) {
        case 'createdAt':
          left = new Date(a.createdAt).getTime();
          right = new Date(b.createdAt).getTime();
          break;
        case 'email':
          left = a.email.toLowerCase();
          right = b.email.toLowerCase();
          break;
        case 'name':
          left = getFullName(a).toLowerCase();
          right = getFullName(b).toLowerCase();
          break;
        case 'source':
          left = a.source.toLowerCase();
          right = b.source.toLowerCase();
          break;
        case 'channel':
          left = (a.channel || '').toLowerCase();
          right = (b.channel || '').toLowerCase();
          break;
        case 'country':
          left = (a.country || '').toLowerCase();
          right = (b.country || '').toLowerCase();
          break;
      }

      if (typeof left === 'number' && typeof right === 'number') {
        return leadSortDirection === 'asc' ? left - right : right - left;
      }

      const leftText = String(left || '');
      const rightText = String(right || '');
      if (leftText === rightText) return 0;
      if (leadSortDirection === 'asc') return leftText > rightText ? 1 : -1;
      return leftText < rightText ? 1 : -1;
    });

    return rows;
  }, [
    leadSortColumn,
    leadSortDirection,
    outreach,
    search,
    showArchived,
    sourceFilter,
  ]);

  const leadSources = useMemo(() => {
    if (!outreach) return [];
    const set = new Set<string>();
    for (const lead of outreach.leads) {
      if (lead.source) set.add(lead.source);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [outreach]);

  const sortedCampaignRows = useMemo(() => {
    const rows = [...(analytics?.campaignTable || [])];
    if (campaignSortDirection === 'none') return rows;

    return rows.sort((a, b) => {
      let left: string | number = '';
      let right: string | number = '';
      switch (campaignSortColumn) {
        case 'campaign':
          left = a.campaign.toLowerCase();
          right = b.campaign.toLowerCase();
          break;
        case 'sessions':
          left = a.sessions;
          right = b.sessions;
          break;
        case 'formSubs':
          left = a.formSubs;
          right = b.formSubs;
          break;
        case 'leads':
          left = a.leads;
          right = b.leads;
          break;
        case 'leadConvRate':
          left = a.leadConvRate;
          right = b.leadConvRate;
          break;
      }

      if (typeof left === 'number' && typeof right === 'number') {
        return campaignSortDirection === 'asc' ? left - right : right - left;
      }

      if (left === right) return 0;
      if (campaignSortDirection === 'asc') return left > right ? 1 : -1;
      return left < right ? 1 : -1;
    });
  }, [analytics?.campaignTable, campaignSortColumn, campaignSortDirection]);

  const readyNowCount = useMemo(() => {
    if (!outreach) return 0;
    return outreach.leads.filter(
      lead => !lead.archived && lead.eligibleForOutreach && lead.nextSendIsDue
    ).length;
  }, [outreach]);

  const readyNowInBatchCount = useMemo(() => {
    if (!outreach) return 0;
    return outreach.leads.filter(lead => {
      if (lead.archived) return false;
      if (!lead.eligibleForOutreach) return false;
      if (!lead.nextSendIsDue) return false;
      if (batchKeyFilter === 'all') return true;
      return (lead.batchKey || 'all') === batchKeyFilter;
    }).length;
  }, [outreach, batchKeyFilter]);

  const eligibleInBatchCount = useMemo(() => {
    if (!outreach) return 0;
    return outreach.leads.filter(lead => {
      if (lead.archived) return false;
      if (!lead.eligibleForOutreach) return false;
      if (batchKeyFilter === 'all') return true;
      return (lead.batchKey || 'all') === batchKeyFilter;
    }).length;
  }, [outreach, batchKeyFilter]);

  const batches = useMemo(() => {
    const serverBatches = outreach?.batches || [];
    const all = {
      key: 'all',
      startIso: null,
      endIso: null,
      total: outreach?.leads.length || 0,
      due: readyNowCount,
      waiting: 0,
      completed: 0,
      archived: 0,
      bounced: 0,
    };
    if (!serverBatches.length) return [all];
    return [all, ...serverBatches];
  }, [outreach?.batches, outreach?.leads.length, readyNowCount]);

  const selectedBatch = useMemo(() => {
    return (
      batches.find(batch => batch.key === batchKeyFilter) || batches[0] || null
    );
  }, [batches, batchKeyFilter]);

  const totalInBatchCount = useMemo(() => {
    if (!outreach) return 0;
    if (batchKeyFilter === 'all') return outreach.leads.length;
    return outreach.leads.filter(
      lead => (lead.batchKey || 'all') === batchKeyFilter
    ).length;
  }, [outreach, batchKeyFilter]);

  const blockedCount = useMemo(() => {
    if (!outreach) return 0;
    return outreach.leads.filter(lead => {
      if (lead.archived) return true;
      const bounced =
        lead.hasBounced === true ||
        lead.stepStatus.some(step => Boolean(step.bounced));
      return bounced;
    }).length;
  }, [outreach]);

  const blockedInBatchCount = useMemo(() => {
    if (!outreach) return 0;
    return outreach.leads.filter(lead => {
      if (
        batchKeyFilter !== 'all' &&
        (lead.batchKey || 'all') !== batchKeyFilter
      )
        return false;
      if (lead.archived) return true;
      const bounced =
        lead.hasBounced === true ||
        lead.stepStatus.some(step => Boolean(step.bounced));
      return bounced;
    }).length;
  }, [outreach, batchKeyFilter]);

  const next24hCount = useMemo(() => {
    if (!outreach) return 0;
    const now = Date.now();
    const end = now + 24 * 60 * 60 * 1000;
    return outreach.leads.filter(lead => {
      if (lead.archived) return false;
      if (!lead.eligibleForOutreach) return false;
      const bounced =
        lead.hasBounced === true ||
        lead.stepStatus.some(step => Boolean(step.bounced));
      if (bounced) return false;
      if (!lead.nextSendAt) return false;
      const t = new Date(lead.nextSendAt).getTime();
      if (!Number.isFinite(t)) return false;
      return t > now && t <= end;
    }).length;
  }, [outreach]);

  const next24hInBatchCount = useMemo(() => {
    if (!outreach) return 0;
    const now = Date.now();
    const end = now + 24 * 60 * 60 * 1000;
    return outreach.leads.filter(lead => {
      if (
        batchKeyFilter !== 'all' &&
        (lead.batchKey || 'all') !== batchKeyFilter
      )
        return false;
      if (lead.archived) return false;
      if (!lead.eligibleForOutreach) return false;
      const bounced =
        lead.hasBounced === true ||
        lead.stepStatus.some(step => Boolean(step.bounced));
      if (bounced) return false;
      if (!lead.nextSendAt) return false;
      const t = new Date(lead.nextSendAt).getTime();
      if (!Number.isFinite(t)) return false;
      return t > now && t <= end;
    }).length;
  }, [outreach, batchKeyFilter]);

  function formatInDays(nextSendAt: string | null) {
    if (!nextSendAt) return '-';
    const t = new Date(nextSendAt).getTime();
    if (!Number.isFinite(t)) return '-';
    const deltaMs = t - Date.now();
    if (deltaMs <= 0) return 'now';
    const days = Math.max(1, Math.round(deltaMs / (24 * 60 * 60 * 1000)));
    return `in ${days}d`;
  }

  function stateForLead(lead: OutreachLead) {
    if (lead.archived) return 'Archived';
    const bounced =
      lead.hasBounced === true ||
      lead.stepStatus.some(step => Boolean(step.bounced));
    if (bounced) return 'Bounced';
    if (lead.currentStep >= 3) return 'Completed';
    if (lead.nextSendIsDue) return 'Due';
    return 'Waiting';
  }

  function stateTone(lead: OutreachLead) {
    const state = stateForLead(lead);
    if (state === 'Due') return 'good';
    if (state === 'Waiting') return 'warn';
    if (state === 'Completed') return 'good';
    if (state === 'Archived') return 'warn';
    return 'bad';
  }
  const pendingStep1Count = useMemo(() => {
    if (!outreach) return 0;
    return outreach.leads.filter(
      lead =>
        !lead.archived && lead.eligibleForOutreach && lead.currentStep === 0
    ).length;
  }, [outreach]);

  const pendingStep1InBatchCount = useMemo(() => {
    if (!outreach) return 0;
    return outreach.leads.filter(lead => {
      if (lead.archived) return false;
      if (!lead.eligibleForOutreach) return false;
      if (lead.currentStep !== 0) return false;
      if (batchKeyFilter === 'all') return true;
      return (lead.batchKey || 'all') === batchKeyFilter;
    }).length;
  }, [outreach, batchKeyFilter]);

  const pendingStep1NotDueInBatchCount = useMemo(() => {
    if (!outreach) return 0;
    return outreach.leads.filter(lead => {
      if (lead.archived) return false;
      if (!lead.eligibleForOutreach) return false;
      if (lead.currentStep !== 0) return false;
      if (lead.nextSendIsDue) return false;
      if (batchKeyFilter === 'all') return true;
      return (lead.batchKey || 'all') === batchKeyFilter;
    }).length;
  }, [outreach, batchKeyFilter]);

  const activeTemplate = useMemo(() => {
    return (
      templates.find(template => template.step === activeTemplateStep) || null
    );
  }, [activeTemplateStep, templates]);

  const totals = {
    sessions: toCount(analytics?.totals?.sessions),
    pageViews: toCount(analytics?.totals?.pageViews),
    leads: toCount(analytics?.totals?.leads),
    formSubmissions: toCount(analytics?.totals?.formSubmissions),
    avgSessionTimeMs: toCount(analytics?.totals?.avgSessionTimeMs),
    avgSessionDurationMs: toCount(analytics?.totals?.avgSessionDurationMs),
    bounceRate: toCount(analytics?.totals?.bounceRate),
    engagedSessions: toCount(analytics?.totals?.engagedSessions),
  };

  const comparisons = analytics?.comparison;

  const updateDraft = (
    leadId: string,
    field: keyof NameDraft,
    value: string
  ) => {
    setNameDrafts(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [field]: value,
      },
    }));
  };

  const resetDraftForLead = (lead: OutreachLead) => {
    setNameDrafts(prev => ({
      ...prev,
      [lead.id]: {
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
      },
    }));
  };

  const saveLeadName = async (lead: OutreachLead): Promise<boolean> => {
    const draft = getDraftForLead(nameDrafts, lead);
    setSavingNameId(lead.id);
    setOutreachError('');

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          firstName: draft.firstName,
          lastName: draft.lastName,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to save lead name')
        );
      }

      await Promise.all([loadOutreach(), loadAudit(false)]);
      return true;
    } catch (error) {
      setOutreachError(
        error instanceof Error ? error.message : 'Failed to save name'
      );
      return false;
    } finally {
      setSavingNameId(null);
    }
  };

  const updateLeadArchive = async (leadId: string, archived: boolean) => {
    setUpdatingArchiveId(leadId);
    setOutreachError('');

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, archived }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to update archive state')
        );
      }

      await Promise.all([loadOutreach(), loadAnalytics(), loadAudit(false)]);
    } catch (error) {
      setOutreachError(
        error instanceof Error
          ? error.message
          : 'Failed to update archive state'
      );
    } finally {
      setUpdatingArchiveId(null);
    }
  };

  const createLead = async () => {
    setCreateLeadError('');
    setCreatingLead(true);

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: newLeadSource,
          email: newLeadEmail,
          firstName: newLeadFirstName,
          lastName: newLeadLastName,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to create lead')
        );
      }

      const body = (await response.json().catch(() => ({}))) as {
        lead?: { id?: string };
      };

      setNewLeadEmail('');
      setNewLeadFirstName('');
      setNewLeadLastName('');
      setAddLeadModalOpen(false);
      await Promise.all([loadOutreach(), loadAnalytics(), loadAudit(false)]);
    } catch (error) {
      setCreateLeadError(
        error instanceof Error ? error.message : 'Failed to create lead'
      );
    } finally {
      setCreatingLead(false);
    }
  };

  const openNameModal = (lead: OutreachLead) => {
    setOutreachError('');
    setNameModalLeadId(lead.id);
  };

  const closeNameModal = () => {
    setNameModalLeadId(null);
  };

  const openTemplateEditor = (step: number) => {
    const template = templateByStep.get(step);
    if (!template) return;
    setTemplateSaveError('');
    setTemplateModalStep(step);
    setTemplateDraftSubject(template.subject);
    setTemplateDraftBodyHtml(template.bodyHtml || '');
  };

  const closeTemplateEditor = () => {
    setTemplateSaveError('');
    setTemplateModalStep(null);
  };

  const saveTemplate = async (options?: { reset?: boolean }) => {
    if (!templateModalStep) return;
    const reset = options?.reset === true;
    setTemplateSaveError('');
    setSavingTemplateStep(templateModalStep);

    try {
      const response = await fetch('/api/admin/outreach/templates', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          reset
            ? { step: templateModalStep, reset: true }
            : {
                step: templateModalStep,
                subject: templateDraftSubject,
                bodyHtml: templateDraftBodyHtml,
              }
        ),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            reset ? 'Failed to reset template' : 'Failed to save template'
          )
        );
      }

      await loadTemplates();
      closeTemplateEditor();
    } catch (error) {
      setTemplateSaveError(
        error instanceof Error ? error.message : 'Failed to save template'
      );
    } finally {
      setSavingTemplateStep(null);
    }
  };

  const openDeleteModal = (lead: OutreachLead) => {
    setDeleteError('');
    setDeleteModalLeadId(lead.id);
  };

  const closeDeleteModal = () => {
    setDeleteError('');
    setDeleteModalLeadId(null);
  };

  const confirmDeleteLead = async () => {
    if (!selectedDeleteLead) return;
    setDeleteError('');
    setDeletingLeadId(selectedDeleteLead.id);
    setOutreachError('');

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDeleteLead.id }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to delete lead')
        );
      }

      closeDeleteModal();
      await Promise.all([loadOutreach(), loadAnalytics(), loadAudit(false)]);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete lead'
      );
    } finally {
      setDeletingLeadId(null);
    }
  };

  const startOutreach = async (lead: OutreachLead) => {
    setOutreachError('');
    setStartingLeadId(lead.id);

    try {
      const response = await fetch('/api/admin/outreach/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to start outreach')
        );
      }

      await Promise.all([loadOutreach(), loadAudit(false)]);
    } catch (error) {
      setOutreachError(
        error instanceof Error ? error.message : 'Failed to start outreach'
      );
    } finally {
      setStartingLeadId(null);
    }
  };

  const runScheduler = async () => {
    setOutreachError('');
    setSchedulerMessage('');
    setRunningScheduler(true);

    try {
      const url = new URL('/api/admin/outreach/run', window.location.origin);
      if (batchKeyFilter && batchKeyFilter !== 'all') {
        url.searchParams.set('batchKey', batchKeyFilter);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include',
      });

      const body = (await response.json().catch(() => ({}))) as {
        sent?: number;
        skipped?: number;
        errors?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error || 'Failed to run scheduler');
      }

      const sent = typeof body.sent === 'number' ? body.sent : 0;
      const skipped = typeof body.skipped === 'number' ? body.skipped : 0;
      const errors = typeof body.errors === 'number' ? body.errors : 0;
      setSchedulerMessage(
        `Scheduler run complete: sent ${sent}, skipped ${skipped}, errors ${errors}.`
      );

      await Promise.all([loadOutreach(), loadAudit(false)]);
    } catch (error) {
      setOutreachError(
        error instanceof Error ? error.message : 'Failed to run scheduler'
      );
    } finally {
      setRunningScheduler(false);
    }
  };

  const openRunSchedulerModal = () => {
    setRunSchedulerConfirmError('');
    setRunSchedulerModalOpen(true);
  };

  const closeRunSchedulerModal = () => {
    setRunSchedulerConfirmError('');
    setRunSchedulerModalOpen(false);
  };

  const confirmRunScheduler = async () => {
    setRunSchedulerConfirmError('');
    closeRunSchedulerModal();

    try {
      await runScheduler();
    } catch (error) {
      setRunSchedulerConfirmError(
        error instanceof Error ? error.message : 'Failed to run scheduler'
      );
    }
  };

  const openLaunchModal = () => {
    setLaunchConfirmError('');
    setLaunchModalOpen(true);
  };

  const closeLaunchModal = () => {
    setLaunchConfirmError('');
    setLaunchModalOpen(false);
  };

  const launchBatchStep1 = async () => {
    setOutreachError('');
    setSchedulerMessage('');
    setLaunchingBatch(true);

    try {
      const url = new URL(
        '/api/admin/outreach/launch-batch',
        window.location.origin
      );
      // Default to prelaunch when "all" is selected, otherwise use selected batch.
      const key = batchKeyFilter === 'all' ? 'prelaunch' : batchKeyFilter;
      url.searchParams.set('batchKey', key);

      const response = await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include',
      });

      const body = (await response.json().catch(() => ({}))) as {
        sent?: number;
        skipped?: number;
        errors?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error || 'Failed to launch batch');
      }

      const sent = typeof body.sent === 'number' ? body.sent : 0;
      const skipped = typeof body.skipped === 'number' ? body.skipped : 0;
      const errors = typeof body.errors === 'number' ? body.errors : 0;
      setSchedulerMessage(
        `Batch launch complete: sent ${sent}, skipped ${skipped}, errors ${errors}.`
      );

      await Promise.all([loadOutreach(), loadAudit(false)]);
    } catch (error) {
      setLaunchConfirmError(
        error instanceof Error ? error.message : 'Failed to launch batch'
      );
      throw error;
    } finally {
      setLaunchingBatch(false);
    }
  };

  const confirmLaunchBatch = async () => {
    setLaunchConfirmError('');
    closeLaunchModal();

    try {
      await launchBatchStep1();
    } catch (error) {
      setLaunchConfirmError(
        error instanceof Error ? error.message : 'Failed to launch batch'
      );
    }
  };

  const openSendModal = (lead: OutreachLead) => {
    setSendError('');
    setSendModalLeadId(lead.id);
  };

  const closeSendModal = () => {
    setSendError('');
    setSendModalLeadId(null);
  };

  const confirmSendNext = async () => {
    if (!selectedSendLead) return;
    setSendError('');
    setSendingLeadId(selectedSendLead.id);

    try {
      const response = await fetch('/api/admin/outreach/send-next', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedSendLead.id }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Failed to send next step')
        );
      }

      closeSendModal();
      await Promise.all([loadOutreach(), loadAudit(false)]);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : 'Failed to send next step'
      );
    } finally {
      setSendingLeadId(null);
    }
  };

  const loadMoreAudit = async () => {
    if (!auditCursor) return;
    setAuditLoadingMore(true);
    try {
      await loadAudit(true, auditCursor);
    } catch (error) {
      setAuditError(
        error instanceof Error
          ? error.message
          : 'Failed to load more audit logs'
      );
    } finally {
      setAuditLoadingMore(false);
    }
  };

  const toggleLeadSort = (column: LeadSortColumn) => {
    const nextDirection = cycleSortDirection(
      column,
      leadSortColumn,
      leadSortDirection
    );
    setLeadSortColumn(column);
    setLeadSortDirection(nextDirection);
  };

  const toggleCampaignSort = (column: CampaignSortColumn) => {
    const nextDirection = cycleSortDirection(
      column,
      campaignSortColumn,
      campaignSortDirection
    );
    setCampaignSortColumn(column);
    setCampaignSortDirection(nextDirection);
  };

  if (isLoading) {
    return (
      <div className='border border-zinc-300 bg-white p-6'>
        <p className='text-sm font-medium text-zinc-600'>
          Loading operations dashboard...
        </p>
      </div>
    );
  }

  if (!analytics && !outreach) {
    return (
      <div className='space-y-4 border border-zinc-300 bg-white p-6'>
        <p className='text-sm font-medium text-zinc-600'>
          Admin data unavailable
        </p>
        <p className='text-sm text-zinc-700'>
          {analyticsError || outreachError || 'Could not load admin dashboard.'}
        </p>
        <Button onClick={() => void loadAll()} className='rounded-none'>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <section className='border border-zinc-300 bg-white p-4 sm:p-5'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <label className='flex items-center gap-2 text-sm text-zinc-700'>
              View
              <select
                value={view}
                onChange={event =>
                  setView(event.target.value as 'analytics' | 'outreach')
                }
                className='h-9 border border-zinc-300 bg-white px-3 text-sm outline-none'
              >
                <option value='analytics'>Analytics</option>
                <option value='outreach'>Email (MailerLite)</option>
              </select>
            </label>

            <label className='flex items-center gap-2 text-sm text-zinc-700'>
              Range
              <select
                value={rangeDays}
                onChange={event =>
                  setRangeDays(
                    Number(event.target.value) as (typeof RANGE_OPTIONS)[number]
                  )
                }
                className='h-9 border border-zinc-300 bg-white px-3 text-sm outline-none'
              >
                {RANGE_OPTIONS.map(days => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </select>
            </label>

            <label className='flex items-center gap-2 text-sm text-zinc-700'>
              <input
                type='checkbox'
                checked={compareEnabled}
                onChange={event => setCompareEnabled(event.target.checked)}
                className='h-4 w-4 rounded border-zinc-400'
              />
              Compare vs previous period
            </label>

            <Button
              onClick={() => void loadAll(true)}
              disabled={isRefreshing}
              className='h-9 rounded-none bg-zinc-900 text-white hover:bg-zinc-800'
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className='text-sm text-zinc-600'>
            Last refresh: {formatDateTime(lastRefreshedAt)} | Timezone:{' '}
            {timezone}
          </div>
        </div>

        {analyticsWarning && (
          <div className='mt-4 border border-amber-800 bg-amber-50 px-3 py-2 text-sm text-amber-900'>
            {analyticsWarning}
          </div>
        )}
        {(analyticsError ||
          mailerLiteError ||
          outreachError ||
          templatesError ||
          auditError) && (
          <div className='mt-4 border border-red-800 bg-red-50 px-3 py-2 text-sm text-red-900'>
            {analyticsError ||
              mailerLiteError ||
              outreachError ||
              templatesError ||
              auditError}
          </div>
        )}
      </section>

      {view === 'analytics' && analytics && (
        <section className='space-y-4'>
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6'>
            <MetricBox
              label='Sessions'
              value={totals.sessions.toLocaleString()}
            />
            <MetricBox
              label='Unique (Range)'
              value={toCount(analytics.uniqueSessions?.range).toLocaleString()}
              delta={comparisons?.uniqueRange?.deltaPercent}
            />
            <MetricBox
              label='Unique (Ever)'
              value={toCount(analytics.uniqueSessions?.ever).toLocaleString()}
            />
            <MetricBox
              label='Unique Daily Avg'
              value={toCount(
                analytics.uniqueSessions?.dailyAverage
              ).toLocaleString()}
            />
            <MetricBox
              label='Leads'
              value={totals.leads.toLocaleString()}
              delta={comparisons?.leads?.deltaPercent}
            />
            <MetricBox
              label='Form Subs'
              value={totals.formSubmissions.toLocaleString()}
            />
          </div>

          {analytics.cal && (
            <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
              <MetricBox
                label='Call Clicks'
                value={toCount(analytics.cal.callClicks).toLocaleString()}
                delta={deltaPercent(
                  toCount(analytics.cal.callClicks),
                  toCount(analytics.cal.callClicksPrevious)
                )}
              />
              <MetricBox
                label='Bookings'
                value={
                  analytics.cal.configured
                    ? toCount(analytics.cal.bookings).toLocaleString()
                    : '-'
                }
                delta={
                  analytics.cal.configured
                    ? deltaPercent(
                        toCount(analytics.cal.bookings),
                        toCount(analytics.cal.bookingsPrevious)
                      )
                    : undefined
                }
              />
              <MetricBox
                label='Click→Book %'
                value={
                  analytics.cal.configured
                    ? `${toCount(
                        analytics.cal.clickToBookingRate
                      ).toLocaleString()}%`
                    : '-'
                }
                delta={
                  analytics.cal.configured
                    ? deltaPercent(
                        toCount(analytics.cal.clickToBookingRate),
                        toCount(analytics.cal.clickToBookingRatePrevious)
                      )
                    : undefined
                }
              />
              <MetricBox
                label='Cancelled'
                value={
                  analytics.cal.configured
                    ? toCount(analytics.cal.bookingsCancelled).toLocaleString()
                    : '-'
                }
              />
            </div>
          )}

          {analytics.cal?.warning && (
            <div className='border border-amber-800 bg-amber-50 px-3 py-2 text-sm text-amber-900'>
              {analytics.cal.warning}
            </div>
          )}

          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            <MetricBox
              label='Avg Session'
              value={formatDuration(totals.avgSessionDurationMs)}
            />
            <MetricBox
              label='Avg Time/Page'
              value={formatDuration(totals.avgSessionTimeMs)}
            />
            <MetricBox label='Bounce Rate' value={`${totals.bounceRate}%`} />
            <MetricBox
              label='Engaged Sessions'
              value={totals.engagedSessions.toLocaleString()}
            />
          </div>

          <div className='grid gap-4 xl:grid-cols-2'>
            <TrendTableCard
              title='Sessions vs Unique Trend'
              rows={(analytics.trends || []).slice(-30)}
            />
            <LeadsTrendTableCard
              title='Leads Trend'
              rows={(analytics.trends || []).slice(-30)}
            />
          </div>

          <div className='grid gap-4 xl:grid-cols-3'>
            <BarRowsCard
              title='Source Mix (UTM first)'
              rows={(analytics.sourceMix || analytics.channels || []).slice(
                0,
                12
              )}
            />
            <BarRowsCard
              title='Top Countries'
              rows={(analytics.countries || []).slice(0, 12)}
            />
            <BarRowsCard
              title='Time of Day (Sessions)'
              rows={(analytics.hourlyStats || []).map(item => ({
                name: `${item.hour.toString().padStart(2, '0')}:00`,
                count: item.sessions,
              }))}
            />
          </div>

          <div className='border border-zinc-300 bg-white'>
            <div className='border-b border-zinc-300 px-4 py-3'>
              <p className='text-xs font-medium text-zinc-500'>
                Campaign Performance (UTM + conversion)
              </p>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[860px]'>
                <thead>
                  <tr className='border-b border-zinc-200 text-left text-xs font-medium text-zinc-500'>
                    <SortableHeader
                      label='Campaign'
                      active={campaignSortColumn === 'campaign'}
                      direction={campaignSortDirection}
                      onClick={() => toggleCampaignSort('campaign')}
                    />
                    <SortableHeader
                      label='Sessions'
                      active={campaignSortColumn === 'sessions'}
                      direction={campaignSortDirection}
                      onClick={() => toggleCampaignSort('sessions')}
                    />
                    <SortableHeader
                      label='Form Subs'
                      active={campaignSortColumn === 'formSubs'}
                      direction={campaignSortDirection}
                      onClick={() => toggleCampaignSort('formSubs')}
                    />
                    <SortableHeader
                      label='Leads'
                      active={campaignSortColumn === 'leads'}
                      direction={campaignSortDirection}
                      onClick={() => toggleCampaignSort('leads')}
                    />
                    <SortableHeader
                      label='Lead Conv %'
                      active={campaignSortColumn === 'leadConvRate'}
                      direction={campaignSortDirection}
                      onClick={() => toggleCampaignSort('leadConvRate')}
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedCampaignRows.slice(0, 50).map(row => (
                    <tr
                      key={row.campaign}
                      className='border-b border-zinc-100 text-sm'
                    >
                      <td className='px-4 py-3 font-medium text-zinc-900'>
                        {row.campaign}
                      </td>
                      <td className='px-4 py-3 text-zinc-700'>
                        {row.sessions}
                      </td>
                      <td className='px-4 py-3 text-zinc-700'>
                        {row.formSubs}
                      </td>
                      <td className='px-4 py-3 text-zinc-700'>{row.leads}</td>
                      <td className='px-4 py-3 text-zinc-700'>
                        {row.leadConvRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {view === 'outreach' && outreach && (
        <section className='space-y-4'>
          <div className='border border-zinc-300 bg-white p-4'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-xs font-medium text-zinc-500'>MailerLite</p>
                <p className='text-sm font-semibold text-zinc-900'>
                  {mailerLite?.group?.name || 'Leads'} group
                </p>
              </div>
              <p className='text-xs text-zinc-500'>
                Group ID: {mailerLite?.group?.id || '-'}
              </p>
            </div>

            {!mailerLite && !mailerLiteError && (
              <p className='mt-3 text-sm text-zinc-600'>
                Loading MailerLite stats...
              </p>
            )}

            {mailerLite && (
              <>
                <div className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-6'>
                  <MetricBox
                    label='Active Subs'
                    value={mailerLite.group.active_count.toLocaleString()}
                  />
                  <MetricBox
                    label='Sent'
                    value={mailerLite.group.sent_count.toLocaleString()}
                  />
                  <MetricBox
                    label='Open Rate'
                    value={mailerLite.group.open_rate?.string || '-'}
                  />
                  <MetricBox
                    label='Click Rate'
                    value={mailerLite.group.click_rate?.string || '-'}
                  />
                  <MetricBox
                    label='Unsubscribed'
                    value={mailerLite.group.unsubscribed_count.toLocaleString()}
                  />
                  <MetricBox
                    label='Bounced'
                    value={mailerLite.group.bounced_count.toLocaleString()}
                  />
                </div>

                <div className='mt-4 grid gap-4 xl:grid-cols-2'>
                  <MailerLiteSignupsChartCard
                    title='Signups (Daily)'
                    rows={mailerLite.signups || []}
                  />
                  <MailerLiteRecentSubscribersCard
                    title='Recent Subscribers'
                    rows={mailerLite.recent || []}
                  />
                </div>
              </>
            )}
          </div>

          <div className='border border-zinc-300 bg-white p-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                <div>
                  <p className='text-xs font-medium text-zinc-500'>
                    Contacts (Supabase)
                  </p>
                  <p className='text-sm font-medium text-zinc-900'>
                    {toCount(outreach.summary?.totalLeads).toLocaleString()}{' '}
                    deduped by email
                  </p>
                </div>

                <div className='flex items-center gap-3'>
                  <span className='text-xs font-medium text-zinc-500'>
                    Delivery
                  </span>
                  <span
                    className='text-sm font-medium text-zinc-900'
                    title='Outreach emails are sent by MailerLite automation. Scheduler + manual send are disabled in this dashboard.'
                  >
                    MailerLite
                  </span>
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button
                  variant='outline'
                  className='h-9 rounded-none border-zinc-300'
                  onClick={() => {
                    setCreateLeadError('');
                    setAddLeadModalOpen(true);
                  }}
                >
                  Add lead
                </Button>
              </div>
            </div>

            <div className='mt-3 border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700'>
              Outreach sending is handled by MailerLite automation. This
              dashboard is now read-only for outreach delivery (no scheduler, no
              manual sends).
            </div>

            <div className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-4'>
              <MetricBox
                label='Active'
                value={toCount(outreach.summary?.activeLeads).toLocaleString()}
              />
              <MetricBox
                label='Archived'
                value={Math.max(
                  0,
                  toCount(outreach.summary?.totalLeads) -
                    toCount(outreach.summary?.activeLeads)
                ).toLocaleString()}
              />
              <MetricBox
                label='Sources'
                value={leadSources.length.toLocaleString()}
              />
              <MetricBox
                label='Showing'
                value={filteredLeads.length.toLocaleString()}
              />
            </div>
          </div>

          <div className='border border-zinc-300 bg-white p-4'>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
              <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder='Search email, source, name, channel, country'
                className='h-9 rounded-none border-zinc-300'
              />

              <select
                value={sourceFilter}
                onChange={event => setSourceFilter(event.target.value)}
                className='h-9 border border-zinc-300 bg-white px-3 text-sm outline-none'
              >
                <option value='all'>All sources</option>
                {leadSources.map(source => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>

              <Button
                variant='outline'
                onClick={() => setShowArchived(false)}
                className={`h-9 rounded-none border-zinc-300 ${
                  !showArchived
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : ''
                }`}
              >
                Active leads
              </Button>

              <Button
                variant='outline'
                onClick={() => setShowArchived(true)}
                className={`h-9 rounded-none border-zinc-300 ${
                  showArchived ? 'bg-zinc-900 text-white hover:bg-zinc-800' : ''
                }`}
              >
                Archived leads
              </Button>
            </div>
            <p className='mt-3 text-sm text-zinc-600'>
              Showing {filteredLeads.length.toLocaleString()} of{' '}
              {(showArchived
                ? Math.max(
                    0,
                    toCount(outreach.summary?.totalLeads) -
                      toCount(outreach.summary?.activeLeads)
                  )
                : toCount(outreach.summary?.activeLeads)
              ).toLocaleString()}{' '}
              leads.
            </p>
          </div>

          <div className='border border-zinc-300 bg-white'>
            <div className='max-h-[70vh] overflow-auto'>
              <table className='w-full min-w-[1140px] table-fixed border-separate border-spacing-0'>
                <colgroup>
                  <col className='w-[34px]' />
                  <col className='w-[260px]' />
                  <col className='w-[180px]' />
                  <col className='w-[180px]' />
                  <col className='w-[140px]' />
                  <col className='w-[120px]' />
                  <col className='w-[160px]' />
                  <col className='w-[120px]' />
                </colgroup>
                <thead className='sticky top-0 z-10 bg-zinc-50'>
                  <tr className='border-b border-zinc-200 text-left text-[11px] font-medium text-zinc-600'>
                    <th className='px-2 py-2 font-medium' />
                    <SortableHeader
                      label='Email'
                      active={leadSortColumn === 'email'}
                      direction={leadSortDirection}
                      onClick={() => toggleLeadSort('email')}
                    />
                    <SortableHeader
                      label='Name'
                      active={leadSortColumn === 'name'}
                      direction={leadSortDirection}
                      onClick={() => toggleLeadSort('name')}
                    />
                    <SortableHeader
                      label='Source'
                      active={leadSortColumn === 'source'}
                      direction={leadSortDirection}
                      onClick={() => toggleLeadSort('source')}
                    />
                    <SortableHeader
                      label='Channel'
                      active={leadSortColumn === 'channel'}
                      direction={leadSortDirection}
                      onClick={() => toggleLeadSort('channel')}
                    />
                    <SortableHeader
                      label='Country'
                      active={leadSortColumn === 'country'}
                      direction={leadSortDirection}
                      onClick={() => toggleLeadSort('country')}
                    />
                    <SortableHeader
                      label='Created'
                      active={leadSortColumn === 'createdAt'}
                      direction={leadSortDirection}
                      onClick={() => toggleLeadSort('createdAt')}
                    />
                    <th className='px-2 py-2 font-medium'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => {
                    const fullName = getFullName(lead);
                    const isArchiving = updatingArchiveId === lead.id;
                    const isExpanded = expandedLeadIds.has(lead.id);

                    return (
                      <>
                        <tr
                          key={lead.id}
                          className='group border-b border-zinc-100 text-[11px] text-zinc-800 hover:bg-zinc-50'
                        >
                          <td className='px-2 py-2'>
                            <button
                              type='button'
                              className='h-6 w-6 border border-zinc-300 bg-white font-mono text-[12px] leading-6 text-zinc-700 hover:bg-zinc-50'
                              onClick={() => {
                                setExpandedLeadIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(lead.id)) next.delete(lead.id);
                                  else next.add(lead.id);
                                  return next;
                                });
                              }}
                              aria-label='Toggle lead details'
                            >
                              {isExpanded ? '-' : '+'}
                            </button>
                          </td>
                          <td className='px-2 py-2 font-medium text-zinc-900'>
                            <p
                              className='truncate font-mono'
                              title={lead.email}
                            >
                              {lead.email}
                            </p>
                          </td>
                          <td className='px-2 py-2'>
                            <p
                              className={`truncate ${
                                fullName ? 'text-zinc-900' : 'text-zinc-500'
                              }`}
                              title={fullName || ''}
                            >
                              {fullName || '-'}
                            </p>
                          </td>
                          <td className='px-2 py-2'>
                            <p
                              className='truncate font-mono text-zinc-700'
                              title={lead.source}
                            >
                              {lead.source}
                            </p>
                          </td>
                          <td className='px-2 py-2 text-zinc-700'>
                            <p className='truncate' title={lead.channel || ''}>
                              {lead.channel || '-'}
                            </p>
                          </td>
                          <td className='px-2 py-2 text-zinc-700'>
                            <p className='truncate' title={lead.country || ''}>
                              {lead.country || '-'}
                            </p>
                          </td>
                          <td className='px-2 py-2 font-mono text-zinc-700'>
                            {formatDateTime(lead.createdAt)}
                          </td>
                          <td className='px-2 py-2'>
                            <div className='flex items-center gap-2 whitespace-nowrap'>
                              {lead.archived ? (
                                <Button
                                  variant='outline'
                                  disabled={isArchiving}
                                  className='h-7 rounded-none border-zinc-300 px-2 text-[11px]'
                                  onClick={() =>
                                    void updateLeadArchive(lead.id, false)
                                  }
                                >
                                  {isArchiving ? '...' : 'Unarchive'}
                                </Button>
                              ) : (
                                <Button
                                  variant='outline'
                                  disabled={isArchiving}
                                  className='h-7 rounded-none border-zinc-300 px-2 text-[11px]'
                                  onClick={() =>
                                    void updateLeadArchive(lead.id, true)
                                  }
                                >
                                  {isArchiving ? '...' : 'Archive'}
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type='button'
                                    className='inline-flex h-7 w-7 items-center justify-center border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                                    aria-label='Row actions'
                                  >
                                    <MoreHorizontal className='h-4 w-4' />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align='end'
                                  className='w-[280px] rounded-none border-zinc-300'
                                >
                                  <DropdownMenuItem
                                    onSelect={() => openNameModal(lead)}
                                  >
                                    Edit name...
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={isArchiving}
                                    onSelect={() =>
                                      void updateLeadArchive(
                                        lead.id,
                                        !lead.archived
                                      )
                                    }
                                  >
                                    {lead.archived ? 'Unarchive' : 'Archive'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className='bg-zinc-200' />
                                  <DropdownMenuItem
                                    className='text-red-700 focus:text-red-700'
                                    disabled={deletingLeadId === lead.id}
                                    onSelect={() => openDeleteModal(lead)}
                                  >
                                    Delete permanently...
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className='border-b border-zinc-100 bg-zinc-50/50'>
                            <td colSpan={8} className='px-2 py-3'>
                              <div className='grid gap-3 md:grid-cols-2'>
                                <div className='border border-zinc-200 bg-white p-3'>
                                  <p className='text-[11px] font-medium text-zinc-500'>
                                    Overview
                                  </p>
                                  <div className='mt-2 space-y-1 text-[12px] text-zinc-800'>
                                    <div className='flex justify-between gap-3'>
                                      <span className='text-zinc-500'>
                                        Created
                                      </span>
                                      <span className='font-mono tabular-nums'>
                                        {formatDateTime(lead.createdAt)}
                                      </span>
                                    </div>
                                    <div className='flex justify-between gap-3'>
                                      <span className='text-zinc-500'>
                                        Source
                                      </span>
                                      <span className='font-mono'>
                                        {lead.source}
                                      </span>
                                    </div>
                                    <div className='flex justify-between gap-3'>
                                      <span className='text-zinc-500'>
                                        Channel
                                      </span>
                                      <span className='font-mono'>
                                        {lead.channel || '-'}
                                      </span>
                                    </div>
                                    <div className='flex justify-between gap-3'>
                                      <span className='text-zinc-500'>
                                        Country
                                      </span>
                                      <span>{lead.country || '-'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className='border border-zinc-200 bg-white p-3'>
                                  <p className='text-[11px] font-medium text-zinc-500'>
                                    Metadata
                                  </p>
                                  <div className='mt-2 space-y-1 text-[12px] text-zinc-800'>
                                    <div className='flex justify-between gap-3'>
                                      <span className='text-zinc-500'>
                                        Lead ID
                                      </span>
                                      <span className='font-mono'>
                                        {lead.id}
                                      </span>
                                    </div>
                                    <div className='flex justify-between gap-3'>
                                      <span className='text-zinc-500'>
                                        Archived
                                      </span>
                                      <span className='font-mono'>
                                        {lead.archived ? 'true' : 'false'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className='px-4 py-6 text-sm text-zinc-600'>
                No leads match this filter.
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <details className='border border-zinc-300 bg-white'>
              <summary className='cursor-pointer select-none px-4 py-3 text-xs font-medium text-zinc-500'>
                Email templates
              </summary>
              <div className='border-t border-zinc-300 p-4'>
                <div className='flex flex-wrap gap-2'>
                  {templates.map(template => (
                    <button
                      key={template.step}
                      onClick={() => setActiveTemplateStep(template.step)}
                      className={`h-8 border px-3 text-xs ${
                        activeTemplateStep === template.step
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-300 bg-white text-zinc-700'
                      }`}
                    >
                      Step {template.step} (Day {template.dayOffset})
                    </button>
                  ))}
                </div>
                {activeTemplate && (
                  <div className='mt-4 border border-zinc-200 p-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <p className='text-sm font-semibold text-zinc-900'>
                        {activeTemplate.subject}
                      </p>
                      <div className='flex items-center gap-2'>
                        {activeTemplate.isOverride && (
                          <span className='h-8 border border-zinc-300 bg-white px-2 text-[11px] leading-8 text-zinc-600'>
                            Override
                          </span>
                        )}
                        <Button
                          variant='outline'
                          className='h-8 rounded-none border-zinc-300 px-3 text-xs'
                          onClick={() =>
                            openTemplateEditor(activeTemplate.step)
                          }
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                    <p className='mt-2 text-sm text-zinc-700'>
                      {activeTemplate.snippet}
                    </p>
                    <p className='mt-2 text-xs text-zinc-500'>
                      Tokens:{' '}
                      <span className='font-mono'>{'{{greeting}}'}</span>,{' '}
                      <span className='font-mono'>{'{{email}}'}</span>,{' '}
                      <span className='font-mono'>{'{{firstName}}'}</span>,{' '}
                      <span className='font-mono'>{'{{lastName}}'}</span>,{' '}
                      <span className='font-mono'>{'{{name}}'}</span>,{' '}
                      <span className='font-mono'>
                        {'{{unsubscribeToken}}'}
                      </span>
                      .
                    </p>
                  </div>
                )}
              </div>
            </details>

            <details className='border border-zinc-300 bg-white'>
              <summary className='cursor-pointer select-none px-4 py-3 text-xs font-medium text-zinc-500'>
                Audit log
              </summary>
              <div className='border-t border-zinc-300 p-4'>
                <div className='max-h-[360px] overflow-auto border border-zinc-200'>
                  <table className='w-full min-w-[640px]'>
                    <thead>
                      <tr className='border-b border-zinc-200 text-left text-xs font-medium text-zinc-500'>
                        <th className='px-3 py-2 font-medium'>Time</th>
                        <th className='px-3 py-2 font-medium'>Actor</th>
                        <th className='px-3 py-2 font-medium'>Event</th>
                        <th className='px-3 py-2 font-medium'>Target</th>
                        <th className='px-3 py-2 font-medium'>Meta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditEvents.map(event => (
                        <tr
                          key={event.id}
                          className='border-b border-zinc-100 text-xs'
                        >
                          <td className='px-3 py-2 text-zinc-700'>
                            {formatDateTime(event.created_at)}
                          </td>
                          <td className='px-3 py-2 text-zinc-700'>
                            {event.actor}
                          </td>
                          <td className='px-3 py-2 text-zinc-900'>
                            {event.event_type}
                          </td>
                          <td className='px-3 py-2 text-zinc-700'>
                            {event.target_type || '-'} {event.target_id || ''}
                          </td>
                          <td className='px-3 py-2 text-zinc-700'>
                            {JSON.stringify(event.metadata || {}).slice(0, 120)}
                          </td>
                        </tr>
                      ))}
                      {auditEvents.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className='px-3 py-4 text-sm text-zinc-500'
                          >
                            No audit events yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className='mt-3'>
                  <Button
                    variant='outline'
                    disabled={!auditCursor || auditLoadingMore}
                    className='h-8 rounded-none border-zinc-300'
                    onClick={() => void loadMoreAudit()}
                  >
                    {auditLoadingMore
                      ? 'Loading...'
                      : auditCursor
                        ? 'Load more'
                        : 'No more'}
                  </Button>
                </div>
              </div>
            </details>
          </div>
        </section>
      )}

      {selectedNameLead && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          {(() => {
            const draft = getDraftForLead(nameDrafts, selectedNameLead);
            const nameDirty =
              draft.firstName.trim() !==
                (selectedNameLead.firstName || '').trim() ||
              draft.lastName.trim() !==
                (selectedNameLead.lastName || '').trim();

            return (
              <div className='w-full max-w-xl border border-zinc-300 bg-white p-5'>
                <p className='text-xs font-medium text-zinc-500'>Edit lead</p>
                <h3 className='mt-1 text-lg font-semibold text-zinc-900'>
                  Name fields
                </h3>

                <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                  <InfoLine label='Email' value={selectedNameLead.email} />
                  <InfoLine
                    label='Source'
                    value={selectedNameLead.source || '-'}
                  />
                </div>

                <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                  <label className='text-sm text-zinc-700'>
                    First name
                    <Input
                      value={draft.firstName}
                      onChange={event =>
                        updateDraft(
                          selectedNameLead.id,
                          'firstName',
                          event.target.value
                        )
                      }
                      className='mt-1 h-9 rounded-none border-zinc-300'
                      placeholder='First'
                    />
                  </label>
                  <label className='text-sm text-zinc-700'>
                    Surname
                    <Input
                      value={draft.lastName}
                      onChange={event =>
                        updateDraft(
                          selectedNameLead.id,
                          'lastName',
                          event.target.value
                        )
                      }
                      className='mt-1 h-9 rounded-none border-zinc-300'
                      placeholder='Surname'
                    />
                  </label>
                </div>

                <div className='mt-5 flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    className='h-9 rounded-none border-zinc-300'
                    onClick={() => {
                      resetDraftForLead(selectedNameLead);
                      closeNameModal();
                    }}
                    disabled={savingNameId === selectedNameLead.id}
                  >
                    Cancel
                  </Button>
                  <Button
                    className='h-9 rounded-none bg-zinc-900 text-white hover:bg-zinc-800'
                    onClick={async () => {
                      const ok = await saveLeadName(selectedNameLead);
                      if (ok) closeNameModal();
                    }}
                    disabled={
                      !nameDirty || savingNameId === selectedNameLead.id
                    }
                  >
                    {savingNameId === selectedNameLead.id
                      ? 'Saving...'
                      : 'Save'}
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {runSchedulerModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-xl border border-zinc-300 bg-white p-5'>
            <p className='text-xs font-medium text-zinc-500'>Confirm</p>
            <h3 className='mt-1 text-lg font-semibold text-zinc-900'>
              Send due now
            </h3>

            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <InfoLine
                label='Batch'
                value={selectedBatch ? formatBatchLabel(selectedBatch) : '-'}
              />
              <InfoLine
                label='Ready now (deduped)'
                value={readyNowInBatchCount.toLocaleString()}
              />
              <InfoLine
                label='Eligible (deduped)'
                value={eligibleInBatchCount.toLocaleString()}
              />
            </div>

            <p className='mt-4 text-sm text-zinc-700'>
              This does not bypass schedule. It sends only steps that are due
              (including overdue), deduped by email. New leads created today
              typically remain Pending S1 until the Step 1 delay passes.
            </p>

            {runSchedulerConfirmError && (
              <p className='mt-3 text-sm text-red-700'>
                {runSchedulerConfirmError}
              </p>
            )}

            <div className='mt-5 flex justify-end gap-2'>
              <Button
                variant='outline'
                className='h-9 rounded-none border-zinc-300'
                onClick={closeRunSchedulerModal}
                disabled={runningScheduler}
              >
                Cancel
              </Button>
              <Button
                className='h-9 rounded-none bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-500'
                onClick={() => void confirmRunScheduler()}
                disabled={runningScheduler}
              >
                {runningScheduler ? 'Running...' : 'Send to Ready now'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {launchModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-xl border border-zinc-300 bg-white p-5'>
            <p className='text-xs font-medium text-zinc-500'>Confirm launch</p>
            <h3 className='mt-1 text-lg font-semibold text-zinc-900'>
              Send Step 1 to entire batch
            </h3>

            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <InfoLine
                label='Batch'
                value={selectedBatch ? formatBatchLabel(selectedBatch) : '-'}
              />
              <InfoLine
                label='Recipients (deduped)'
                value={pendingStep1InBatchCount.toLocaleString()}
              />
              <InfoLine
                label='Subject'
                value={templateByStep.get(1)?.subject || '-'}
              />
            </div>

            <div className='mt-4 border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700'>
              <p className='mb-2 font-medium text-zinc-900'>Snippet</p>
              <p>{templateByStep.get(1)?.snippet || '-'}</p>
            </div>

            <p className='mt-3 text-sm text-amber-700'>
              This bypasses schedule. It sends Step 1 now to every eligible
              contact in the selected batch. Step 2 and Step 3 will continue on
              the normal cadence.
            </p>

            {launchConfirmError && (
              <p className='mt-3 text-sm text-red-700'>{launchConfirmError}</p>
            )}

            <div className='mt-5 flex justify-end gap-2'>
              <Button
                variant='outline'
                className='h-9 rounded-none border-zinc-300'
                onClick={closeLaunchModal}
                disabled={launchingBatch}
              >
                Cancel
              </Button>
              <Button
                className='h-9 rounded-none bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-500'
                onClick={() => void confirmLaunchBatch()}
                disabled={launchingBatch || pendingStep1InBatchCount <= 0}
              >
                {launchingBatch ? 'Sending...' : 'Send Step 1 now'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {addLeadModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-xl border border-zinc-300 bg-white p-5'>
            <p className='text-xs font-medium text-zinc-500'>Add lead</p>
            <h3 className='mt-1 text-lg font-semibold text-zinc-900'>
              New contact
            </h3>

            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <label className='text-sm text-zinc-700'>
                Source
                <select
                  value={newLeadSource}
                  onChange={event => setNewLeadSource(event.target.value)}
                  className='mt-1 h-9 w-full border border-zinc-300 bg-white px-3 text-sm outline-none'
                >
                  {LEAD_SOURCE_OPTIONS.map(source => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <label className='text-sm text-zinc-700'>
                Email
                <Input
                  value={newLeadEmail}
                  onChange={event => setNewLeadEmail(event.target.value)}
                  className='mt-1 h-9 rounded-none border-zinc-300'
                  placeholder='lead@company.com'
                />
              </label>
              <label className='text-sm text-zinc-700'>
                First name
                <Input
                  value={newLeadFirstName}
                  onChange={event => setNewLeadFirstName(event.target.value)}
                  className='mt-1 h-9 rounded-none border-zinc-300'
                  placeholder='First'
                />
              </label>
              <label className='text-sm text-zinc-700'>
                Surname
                <Input
                  value={newLeadLastName}
                  onChange={event => setNewLeadLastName(event.target.value)}
                  className='mt-1 h-9 rounded-none border-zinc-300'
                  placeholder='Surname'
                />
              </label>
            </div>

            {createLeadError && (
              <p className='mt-3 text-sm text-red-700'>{createLeadError}</p>
            )}

            <div className='mt-5 flex justify-end gap-2'>
              <Button
                variant='outline'
                className='h-9 rounded-none border-zinc-300'
                onClick={() => setAddLeadModalOpen(false)}
                disabled={creatingLead}
              >
                Cancel
              </Button>
              <Button
                className='h-9 rounded-none bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-500'
                disabled={creatingLead || !newLeadEmail.trim()}
                onClick={() => void createLead()}
              >
                {creatingLead ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedSendLead && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-2xl border border-zinc-300 bg-white p-5'>
            <p className='text-xs font-medium text-zinc-500'>
              Confirm manual send
            </p>
            <h3 className='mt-1 text-lg font-semibold text-zinc-900'>
              Send next outreach step now
            </h3>

            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <InfoLine label='Recipient' value={selectedSendLead.email} />
              <InfoLine
                label='Step'
                value={String(
                  selectedSendLead.nextStep || selectedSendLead.currentStep
                )}
              />
              <InfoLine
                label='Subject'
                value={
                  selectedSendLead.nextStep
                    ? templateByStep.get(selectedSendLead.nextStep)?.subject ||
                      '-'
                    : '-'
                }
              />
              <InfoLine
                label='Last sent timestamp'
                value={formatDateTime(selectedSendLead.lastSentAt || null)}
              />
            </div>

            <div className='mt-4 border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700'>
              <p className='mb-2 font-medium text-zinc-900'>Snippet preview</p>
              <p>
                {selectedSendLead.nextStep
                  ? templateByStep.get(selectedSendLead.nextStep)?.snippet ||
                    '-'
                  : '-'}
              </p>
            </div>

            <p className='mt-3 text-sm text-amber-700'>
              Warning: this action bypasses schedule and sends immediately.
            </p>
            {sendError && (
              <p className='mt-2 text-sm text-red-700'>{sendError}</p>
            )}

            <div className='mt-5 flex justify-end gap-2'>
              <Button
                variant='outline'
                className='h-9 rounded-none border-zinc-300'
                onClick={closeSendModal}
                disabled={sendingLeadId === selectedSendLead.id}
              >
                Cancel
              </Button>
              <Button
                className='h-9 rounded-none bg-zinc-900 text-white hover:bg-zinc-800'
                onClick={() => void confirmSendNext()}
                disabled={sendingLeadId === selectedSendLead.id}
              >
                {sendingLeadId === selectedSendLead.id
                  ? 'Sending...'
                  : 'Confirm send'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {templateModalStep && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-3xl border border-zinc-300 bg-white p-5'>
            <p className='text-xs font-medium text-zinc-500'>Edit template</p>
            <h3 className='mt-1 text-lg font-semibold text-zinc-900'>
              Outreach step {templateModalStep}
            </h3>

            <div className='mt-4 grid gap-3'>
              <label className='text-sm text-zinc-700'>
                Subject
                <Input
                  value={templateDraftSubject}
                  onChange={event =>
                    setTemplateDraftSubject(event.target.value)
                  }
                  className='mt-1 h-9 rounded-none border-zinc-300'
                />
              </label>
              <label className='text-sm text-zinc-700'>
                Body (HTML)
                <textarea
                  value={templateDraftBodyHtml}
                  onChange={event =>
                    setTemplateDraftBodyHtml(event.target.value)
                  }
                  className='mt-1 h-[260px] w-full resize-none rounded-none border border-zinc-300 bg-white p-3 font-mono text-xs text-zinc-900 outline-none'
                />
              </label>
              <p className='text-xs text-zinc-500'>
                Keep it barebones (no CSS). Use{' '}
                <span className='font-mono'>{'<p>'}</span> for paragraphs and{' '}
                <span className='font-mono'>{'<a href=\"...\">'}</span> for
                hyperlinks.
              </p>
              <p className='text-xs text-zinc-500'>
                Tokens: <span className='font-mono'>{'{{greeting}}'}</span>,{' '}
                <span className='font-mono'>{'{{email}}'}</span>,{' '}
                <span className='font-mono'>{'{{firstName}}'}</span>,{' '}
                <span className='font-mono'>{'{{lastName}}'}</span>,{' '}
                <span className='font-mono'>{'{{name}}'}</span>,{' '}
                <span className='font-mono'>{'{{unsubscribeToken}}'}</span>.
              </p>
            </div>

            {templateSaveError && (
              <p className='mt-3 text-sm text-red-700'>{templateSaveError}</p>
            )}

            <div className='mt-6 flex flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center'>
              <Button
                variant='outline'
                className='h-9 rounded-none border-zinc-300'
                onClick={() => void saveTemplate({ reset: true })}
                disabled={savingTemplateStep === templateModalStep}
              >
                Reset to default
              </Button>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  className='h-9 rounded-none border-zinc-300'
                  onClick={closeTemplateEditor}
                  disabled={savingTemplateStep === templateModalStep}
                >
                  Cancel
                </Button>
                <Button
                  className='h-9 rounded-none bg-zinc-900 text-white hover:bg-zinc-800'
                  onClick={() => void saveTemplate()}
                  disabled={
                    savingTemplateStep === templateModalStep ||
                    !templateDraftSubject.trim() ||
                    !templateDraftBodyHtml.trim()
                  }
                >
                  {savingTemplateStep === templateModalStep
                    ? 'Saving...'
                    : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDeleteLead && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-xl border border-zinc-300 bg-white p-5'>
            <p className='text-xs font-medium text-zinc-500'>
              Permanent deletion
            </p>
            <h3 className='mt-1 text-lg font-semibold text-zinc-900'>
              Delete lead
            </h3>

            <div className='mt-4 space-y-2 text-sm text-zinc-700'>
              <p>
                Are you sure you want to perma delete{' '}
                <span className='font-mono text-zinc-900'>
                  {selectedDeleteLead.email}
                </span>{' '}
                from the list?
              </p>
              <p className='text-amber-700'>
                This is permanent and cannot be undone (lead + outreach
                history).
              </p>
            </div>

            {deleteError && (
              <p className='mt-3 text-sm text-red-700'>{deleteError}</p>
            )}

            <div className='mt-6 flex justify-end gap-2'>
              <Button
                variant='outline'
                className='h-9 rounded-none border-zinc-300'
                onClick={closeDeleteModal}
                disabled={deletingLeadId === selectedDeleteLead.id}
              >
                Cancel
              </Button>
              <Button
                className='h-9 rounded-none bg-red-600 text-white hover:bg-red-700'
                onClick={() => void confirmDeleteLead()}
                disabled={deletingLeadId === selectedDeleteLead.id}
              >
                {deletingLeadId === selectedDeleteLead.id
                  ? 'Deleting...'
                  : 'Delete permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBox({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  const tone = delta === undefined ? 'warn' : getTrendTone(delta);
  return (
    <div className='border border-zinc-300 bg-white p-3'>
      <p className='text-xs font-medium text-zinc-500'>{label}</p>
      <p className='mt-2 text-2xl font-semibold text-zinc-900'>{value}</p>
      {delta !== undefined && (
        <p className={`mt-1 text-xs ${getHealthClass(tone)}`}>
          {delta > 0 ? '+' : ''}
          {delta}% vs previous
        </p>
      )}
    </div>
  );
}

function HealthCell({
  label,
  value,
  level,
}: {
  label: string;
  value: string;
  level: 'good' | 'warn' | 'bad';
}) {
  return (
    <div className='border border-zinc-200 bg-white px-3 py-2'>
      <p className='text-xs font-medium text-zinc-500'>{label}</p>
      <p className={`mt-1 text-lg font-semibold ${getHealthClass(level)}`}>
        {value}
      </p>
    </div>
  );
}

function StagePill({ label, value }: { label: string; value: number }) {
  return (
    <div className='border border-zinc-300 bg-white px-3 py-2'>
      <p className='text-xs font-medium text-zinc-500'>{label}</p>
      <p className='mt-1 text-xl font-semibold text-zinc-900'>{value}</p>
    </div>
  );
}

function SortableHeader({
  label,
  active,
  direction,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  className?: string;
}) {
  const suffix =
    !active || direction === 'none' ? '' : direction === 'asc' ? ' ↑' : ' ↓';
  return (
    <th className={cn('px-2 py-2 font-medium whitespace-nowrap', className)}>
      <button
        className='text-left text-zinc-600 hover:text-zinc-900'
        onClick={onClick}
      >
        {label}
        {suffix}
      </button>
    </th>
  );
}

function TrendTableCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ date: string; sessions: number; uniqueDaily: number }>;
}) {
  const gradientId = useId().replace(/:/g, '');

  const chartConfig = {
    sessions: {
      label: 'Sessions',
      color: 'hsl(var(--chart-1))',
    },
    uniqueDaily: {
      label: 'Unique (Daily)',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <div className='border border-zinc-300 bg-white'>
      <div className='border-b border-zinc-300 px-4 py-3'>
        <p className='text-xs font-medium text-zinc-500'>{title}</p>
      </div>
      <div className='p-4'>
        {rows.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='h-[240px] w-full aspect-auto'
          >
            <AreaChart data={rows} margin={{ left: 0, right: 8, top: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval='preserveStartEnd'
                tickFormatter={value => {
                  const date = new Date(String(value));
                  if (Number.isNaN(date.getTime())) return String(value);
                  return shortDateFormatter.format(date);
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator='line'
                    labelFormatter={value => formatDate(String(value))}
                  />
                }
              />
              <defs>
                <linearGradient
                  id={`fill-sessions-${gradientId}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='var(--color-sessions)'
                    stopOpacity={0.35}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-sessions)'
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient
                  id={`fill-unique-${gradientId}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='var(--color-uniqueDaily)'
                    stopOpacity={0.25}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-uniqueDaily)'
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey='sessions'
                type='natural'
                stroke='var(--color-sessions)'
                fill={`url(#fill-sessions-${gradientId})`}
                fillOpacity={1}
                strokeWidth={2}
              />
              <Area
                dataKey='uniqueDaily'
                type='natural'
                stroke='var(--color-uniqueDaily)'
                fill={`url(#fill-unique-${gradientId})`}
                fillOpacity={1}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className='text-sm text-zinc-500'>No trend data</p>
        )}
      </div>
      <details className='border-t border-zinc-200'>
        <summary className='cursor-pointer select-none px-4 py-3 text-xs font-medium text-zinc-500'>
          Table view
        </summary>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[460px]'>
            <thead>
              <tr className='border-b border-zinc-200 text-left text-xs font-medium text-zinc-500'>
                <th className='px-4 py-3 font-medium'>Date</th>
                <th className='px-4 py-3 font-medium'>Sessions</th>
                <th className='px-4 py-3 font-medium'>Unique Daily</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.date} className='border-b border-zinc-100 text-sm'>
                  <td className='px-4 py-3 text-zinc-700'>
                    {formatDate(row.date)}
                  </td>
                  <td className='px-4 py-3 text-zinc-900'>
                    {row.sessions.toLocaleString()}
                  </td>
                  <td className='px-4 py-3 text-zinc-900'>
                    {row.uniqueDaily.toLocaleString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className='px-4 py-4 text-sm text-zinc-500'>
                    No trend data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function LeadsTrendTableCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ date: string; leads: number }>;
}) {
  const gradientId = useId().replace(/:/g, '');

  const chartConfig = {
    leads: {
      label: 'Leads',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;

  return (
    <div className='border border-zinc-300 bg-white'>
      <div className='border-b border-zinc-300 px-4 py-3'>
        <p className='text-xs font-medium text-zinc-500'>{title}</p>
      </div>
      <div className='p-4'>
        {rows.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='h-[240px] w-full aspect-auto'
          >
            <AreaChart data={rows} margin={{ left: 0, right: 8, top: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval='preserveStartEnd'
                tickFormatter={value => {
                  const date = new Date(String(value));
                  if (Number.isNaN(date.getTime())) return String(value);
                  return shortDateFormatter.format(date);
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator='line'
                    labelFormatter={value => formatDate(String(value))}
                  />
                }
              />
              <defs>
                <linearGradient
                  id={`fill-leads-${gradientId}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='var(--color-leads)'
                    stopOpacity={0.35}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-leads)'
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey='leads'
                type='natural'
                stroke='var(--color-leads)'
                fill={`url(#fill-leads-${gradientId})`}
                fillOpacity={1}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className='text-sm text-zinc-500'>No leads trend data</p>
        )}
      </div>
      <details className='border-t border-zinc-200'>
        <summary className='cursor-pointer select-none px-4 py-3 text-xs font-medium text-zinc-500'>
          Table view
        </summary>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[360px]'>
            <thead>
              <tr className='border-b border-zinc-200 text-left text-xs font-medium text-zinc-500'>
                <th className='px-4 py-3 font-medium'>Date</th>
                <th className='px-4 py-3 font-medium'>Leads</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.date} className='border-b border-zinc-100 text-sm'>
                  <td className='px-4 py-3 text-zinc-700'>
                    {formatDate(row.date)}
                  </td>
                  <td className='px-4 py-3 text-zinc-900'>
                    {row.leads.toLocaleString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={2} className='px-4 py-4 text-sm text-zinc-500'>
                    No leads trend data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function MailerLiteSignupsChartCard({
  title,
  rows,
}: {
  title: string;
  rows: MailerLiteSignupsRow[];
}) {
  const gradientId = useId().replace(/:/g, '');

  const chartConfig = {
    total: {
      label: 'Total',
      color: 'hsl(var(--chart-4))',
    },
    active: {
      label: 'Active',
      color: 'hsl(var(--chart-5))',
    },
  } satisfies ChartConfig;

  return (
    <div className='border border-zinc-300 bg-white'>
      <div className='border-b border-zinc-300 px-4 py-3'>
        <p className='text-xs font-medium text-zinc-500'>{title}</p>
      </div>
      <div className='p-4'>
        {rows.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='h-[240px] w-full aspect-auto'
          >
            <AreaChart data={rows} margin={{ left: 0, right: 8, top: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval='preserveStartEnd'
                tickFormatter={value => {
                  const date = new Date(String(value));
                  if (Number.isNaN(date.getTime())) return String(value);
                  return shortDateFormatter.format(date);
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator='line'
                    labelFormatter={value => formatDate(String(value))}
                  />
                }
              />
              <defs>
                <linearGradient
                  id={`fill-ml-total-${gradientId}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='var(--color-total)'
                    stopOpacity={0.3}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-total)'
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient
                  id={`fill-ml-active-${gradientId}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='var(--color-active)'
                    stopOpacity={0.25}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-active)'
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey='total'
                type='natural'
                stroke='var(--color-total)'
                fill={`url(#fill-ml-total-${gradientId})`}
                fillOpacity={1}
                strokeWidth={2}
              />
              <Area
                dataKey='active'
                type='natural'
                stroke='var(--color-active)'
                fill={`url(#fill-ml-active-${gradientId})`}
                fillOpacity={1}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className='text-sm text-zinc-500'>No MailerLite signup data</p>
        )}
      </div>
    </div>
  );
}

function MailerLiteRecentSubscribersCard({
  title,
  rows,
}: {
  title: string;
  rows: MailerLiteRecentSubscriber[];
}) {
  return (
    <div className='border border-zinc-300 bg-white'>
      <div className='border-b border-zinc-300 px-4 py-3'>
        <p className='text-xs font-medium text-zinc-500'>{title}</p>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[520px]'>
          <thead>
            <tr className='border-b border-zinc-200 text-left text-xs font-medium text-zinc-500'>
              <th className='px-4 py-3 font-medium'>Email</th>
              <th className='px-4 py-3 font-medium'>Status</th>
              <th className='px-4 py-3 font-medium'>Subscribed</th>
              <th className='px-4 py-3 font-medium'>Opens</th>
              <th className='px-4 py-3 font-medium'>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className='border-b border-zinc-100 text-sm'>
                <td className='px-4 py-3 font-mono text-zinc-900'>
                  {row.email}
                </td>
                <td className='px-4 py-3 text-zinc-700'>{row.status}</td>
                <td className='px-4 py-3 font-mono text-zinc-700'>
                  {row.subscribed_at || '-'}
                </td>
                <td className='px-4 py-3 text-zinc-900'>
                  {row.opens_count.toLocaleString()}
                </td>
                <td className='px-4 py-3 text-zinc-900'>
                  {row.clicks_count.toLocaleString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className='px-4 py-4 text-sm text-zinc-500'>
                  No subscriber data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BarRowsCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ name: string; count: number }>;
}) {
  const max = rows.reduce((current, row) => Math.max(current, row.count), 0);
  return (
    <div className='border border-zinc-300 bg-white'>
      <div className='border-b border-zinc-300 px-4 py-3'>
        <p className='text-xs font-medium text-zinc-500'>{title}</p>
      </div>
      <div className='space-y-2 p-4'>
        {rows.slice(0, 16).map(row => {
          const width = max > 0 ? Math.max((row.count / max) * 100, 2) : 0;
          return (
            <div key={row.name} className='space-y-1'>
              <div className='flex items-center justify-between text-xs text-zinc-700'>
                <span className='truncate pr-2'>{row.name}</span>
                <span>{row.count.toLocaleString()}</span>
              </div>
              <div className='h-2 w-full bg-zinc-100'>
                <div
                  className='h-2 bg-zinc-900'
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className='text-sm text-zinc-500'>No data</p>}
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className='border border-zinc-200 px-3 py-2'>
      <p className='text-xs font-medium text-zinc-500'>{label}</p>
      <p className='mt-1 text-sm text-zinc-900'>{value}</p>
    </div>
  );
}
