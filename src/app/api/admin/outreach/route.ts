import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';
import { OUTREACH_STEPS } from '@/lib/outreach-emails';
import { getOutreachAutomationConfig } from '@/lib/outreach-config-store';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Sources that automatically enter the drip sequence (based on lead created_at).
// Everything else can still be started manually via a "Start" action (step=0 in outreach_log).
const AUTO_OUTREACH_SOURCES = new Set([
  'white_paper_download',
  'white_paper_landing',
  'exit_intent',
]);

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function addUtcDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function computeBatch(options: {
  startedAt: string | null;
  batching?: { enabled: boolean; launchCutoffIso: string; windowDays: number };
}): { key: string; startIso: string | null; endIso: string | null } {
  const { startedAt, batching } = options;
  if (!startedAt || !batching?.enabled) {
    return { key: 'all', startIso: null, endIso: null };
  }

  const cutoff = new Date(batching.launchCutoffIso);
  const started = new Date(startedAt);
  if (Number.isNaN(cutoff.getTime()) || Number.isNaN(started.getTime())) {
    return { key: 'all', startIso: null, endIso: null };
  }

  const windowDays = Math.max(1, Math.floor(Number(batching.windowDays) || 7));
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  // "Include today": treat the cutoff as a day boundary (UTC).
  // Prelaunch = everything up to and including the cutoff day.
  const cutoffDayStart = Date.UTC(
    cutoff.getUTCFullYear(),
    cutoff.getUTCMonth(),
    cutoff.getUTCDate()
  );
  const base = cutoffDayStart + 24 * 60 * 60 * 1000; // start of day after cutoff day (UTC)

  if (started.getTime() < base) {
    return {
      key: 'prelaunch',
      startIso: null,
      endIso: new Date(base).toISOString(),
    };
  }

  const index = Math.floor((started.getTime() - base) / windowMs);
  const start = new Date(base + index * windowMs);
  const end = new Date(start.getTime() + windowMs);
  return {
    key: `w${index}`,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function computeNextSendAt(options: {
  startedAt: string;
  logsByStep: Map<number, OutreachLogRow>;
  nextStep: number;
}): string | null {
  const { startedAt, logsByStep, nextStep } = options;
  const stepConfig =
    OUTREACH_STEPS.find(step => step.step === nextStep) || null;
  if (!stepConfig) return null;

  // Cadence model:
  // - Step 1: startedAt + delayDays
  // - Step N>1: previous step sent_at + delayDays
  if (nextStep <= 1) {
    return addUtcDays(startedAt, stepConfig.dayOffset);
  }

  const prev = logsByStep.get(nextStep - 1);
  if (!prev?.sent_at) return null;
  return addUtcDays(prev.sent_at, stepConfig.dayOffset);
}

const PAGE_SIZE = 1000;

type LeadRow = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  source: string;
  channel?: string | null;
  country?: string | null;
  created_at: string;
  archived?: boolean | null;
};

type OutreachLogRow = {
  id: string;
  lead_id: string;
  email: string;
  step: number;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  bounced: boolean;
  resend_id: string | null;
};

async function fetchAllRows<T>(
  fetchPage: (
    from: number,
    to: number
  ) => Promise<{
    data: T[] | null;
    error: { code?: string; message?: string } | null;
  }>
) {
  const rows: T[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await fetchPage(from, to);

    if (error) {
      return { rows: null as T[] | null, error };
    }

    if (!data?.length) break;
    rows.push(...data);

    if (data.length < PAGE_SIZE) break;
  }

  return { rows, error: null };
}

function getNameParts(raw: {
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
}) {
  const firstName =
    typeof raw.first_name === 'string' && raw.first_name.trim()
      ? raw.first_name.trim()
      : null;
  const lastName =
    typeof raw.last_name === 'string' && raw.last_name.trim()
      ? raw.last_name.trim()
      : null;

  if (firstName || lastName) {
    return { firstName, lastName };
  }

  const fullName =
    typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : '';
  if (!fullName) {
    return { firstName: null, lastName: null };
  }

  const [derivedFirst, ...rest] = fullName.split(/\s+/);
  return {
    firstName: derivedFirst || null,
    lastName: rest.length ? rest.join(' ') : null,
  };
}

function isMissingColumnError(
  error: { code?: string; message?: string } | null,
  columnName: string
) {
  if (!error) return false;
  if (error.code !== '42703' && error.code !== 'PGRST204') return false;
  return (error.message || '').toLowerCase().includes(columnName.toLowerCase());
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    const automation = await getOutreachAutomationConfig();

    const { rows: leadsData, error: leadsError } = await fetchAllRows<LeadRow>(
      async (from, to) => {
        const resultWithArchived = await supabase
          .from('leads')
          .select(
            'id,email,first_name,last_name,name,source,channel,country,created_at,archived'
          )
          .order('created_at', { ascending: false })
          .range(from, to);

        if (isMissingColumnError(resultWithArchived.error, 'archived')) {
          const fallbackResult = await supabase
            .from('leads')
            .select(
              'id,email,first_name,last_name,name,source,channel,country,created_at'
            )
            .order('created_at', { ascending: false })
            .range(from, to);

          return {
            data: fallbackResult.data as LeadRow[] | null,
            error: fallbackResult.error,
          };
        }

        return {
          data: resultWithArchived.data as LeadRow[] | null,
          error: resultWithArchived.error,
        };
      }
    );

    if (leadsError || !leadsData) {
      console.error(
        'Failed to fetch leads for outreach dashboard:',
        leadsError
      );
      return NextResponse.json(
        { error: 'Failed to fetch outreach leads' },
        { status: 500 }
      );
    }

    const { rows: logData, error: logsError } =
      await fetchAllRows<OutreachLogRow>(async (from, to) => {
        const result = await supabase
          .from('outreach_log')
          .select(
            'id,lead_id,email,step,sent_at,opened_at,clicked_at,bounced,resend_id'
          )
          .order('sent_at', { ascending: false })
          .range(from, to);

        return {
          data: result.data as OutreachLogRow[] | null,
          error: result.error,
        };
      });

    if (logsError && logsError.code !== '42P01') {
      console.error('Failed to fetch outreach logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch outreach data' },
        { status: 500 }
      );
    }

    const leads = leadsData || [];
    const logs = logData || [];

    const normalizeEmail = (value: string) => value.trim().toLowerCase();

    const leadsByEmail = new Map<string, LeadRow[]>();
    for (const lead of leads) {
      const email = normalizeEmail(lead.email || '');
      if (!email) continue;
      const existing = leadsByEmail.get(email) || [];
      existing.push(lead);
      leadsByEmail.set(email, existing);
    }

    const logsByEmail = new Map<string, OutreachLogRow[]>();
    for (const log of logs) {
      const email = normalizeEmail(log.email || '');
      if (!email) continue;
      const existing = logsByEmail.get(email) || [];
      existing.push(log);
      logsByEmail.set(email, existing);
    }

    const stepMap = new Map<
      number,
      { sent: number; opened: number; clicked: number; bounced: number }
    >();

    const emailLogs = logs.filter(log => log.step > 0);

    for (const log of emailLogs) {
      const current = stepMap.get(log.step) || {
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
      };
      current.sent += 1;
      if (log.opened_at) current.opened += 1;
      if (log.clicked_at) current.clicked += 1;
      if (log.bounced) current.bounced += 1;
      stepMap.set(log.step, current);
    }

    const steps = OUTREACH_STEPS.map(stepConfig => ({
      step: stepConfig.step,
      dayOffset: stepConfig.dayOffset,
      sent: stepMap.get(stepConfig.step)?.sent || 0,
      opened: stepMap.get(stepConfig.step)?.opened || 0,
      clicked: stepMap.get(stepConfig.step)?.clicked || 0,
      bounced: stepMap.get(stepConfig.step)?.bounced || 0,
    }));

    const dateMap = new Map<string, { sent: number; opened: number }>();
    for (const log of emailLogs) {
      const date = new Date(log.sent_at).toISOString().split('T')[0];
      const existing = dateMap.get(date) || { sent: 0, opened: 0 };
      existing.sent += 1;
      if (log.opened_at) existing.opened += 1;
      dateMap.set(date, existing);
    }

    const timeline = Array.from(dateMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const now = Date.now();
    const funnel = {
      notStarted: 0,
      step1: 0,
      step2: 0,
      completed: 0,
    };

    const leadRows = Array.from(leadsByEmail.entries()).map(
      ([email, emailLeads]) => {
        const leadLogs = logsByEmail.get(email) || [];
        const logsByStep = new Map<number, OutreachLogRow>();

        for (const log of leadLogs) {
          const existing = logsByStep.get(log.step);
          if (!existing || log.sent_at > existing.sent_at) {
            logsByStep.set(log.step, log);
          }
        }

        const isArchived = emailLeads.some(lead => lead.archived === true);
        const isAutoSource = emailLeads.some(lead =>
          AUTO_OUTREACH_SOURCES.has(lead.source)
        );

        const leadByCreatedDesc = [...emailLeads].sort((a, b) =>
          b.created_at.localeCompare(a.created_at)
        );
        const canonicalLead = leadByCreatedDesc[0];
        const nameLead =
          leadByCreatedDesc.find(row =>
            Boolean(
              (row.first_name && row.first_name.trim()) ||
              (row.last_name && row.last_name.trim()) ||
              (row.name && row.name.trim())
            )
          ) || canonicalLead;
        const nameParts = getNameParts(nameLead);

        const createdAt = canonicalLead.created_at;

        const autoCreatedAt = isAutoSource
          ? emailLeads
              .filter(row => AUTO_OUTREACH_SOURCES.has(row.source))
              .map(row => row.created_at)
              .sort((a, b) => a.localeCompare(b))[0] || null
          : null;

        const startLogs = leadLogs.filter(log => log.step === 0);
        const manualStartedAt =
          startLogs
            .map(log => log.sent_at)
            .sort((a, b) => a.localeCompare(b))[0] || null;

        // Ops model: every contact is considered enrolled by default.
        // - Auto sources use the earliest auto lead timestamp.
        // - Otherwise we fall back to an explicit "Start" log if present, else the earliest lead created_at.
        const earliestCreatedAt =
          leadByCreatedDesc
            .map(row => row.created_at)
            .sort((a, b) => a.localeCompare(b))[0] || null;

        const startedAt = isAutoSource
          ? autoCreatedAt
          : manualStartedAt || earliestCreatedAt;

        const eligibleForOutreach = Boolean(startedAt) && !isArchived;

        const emailStepLogs = leadLogs.filter(entry => entry.step > 0);
        const hasBounced = emailStepLogs.some(entry => Boolean(entry.bounced));
        const currentStep = emailStepLogs.reduce(
          (max, entry) => (entry.step > max ? entry.step : max),
          0
        );

        let nextStep: number | null = null;
        if (eligibleForOutreach && !isArchived) {
          for (const stepConfig of OUTREACH_STEPS) {
            if (!logsByStep.has(stepConfig.step)) {
              nextStep = stepConfig.step;
              break;
            }
          }
        }

        const nextSendAt =
          nextStep && startedAt
            ? computeNextSendAt({ startedAt, logsByStep, nextStep })
            : null;
        const nextSendIsDue = nextSendAt
          ? new Date(nextSendAt).getTime() <= now
          : false;

        const batch = computeBatch({
          startedAt: startedAt || null,
          batching: automation.batching,
        });

        const state = isArchived
          ? 'archived'
          : hasBounced
            ? 'bounced'
            : currentStep >= OUTREACH_STEPS.length
              ? 'completed'
              : nextStep && nextSendIsDue
                ? 'due'
                : 'waiting';

        const statusLabel = isArchived
          ? 'Archived'
          : !eligibleForOutreach
            ? 'Pending S1'
            : currentStep >= OUTREACH_STEPS.length
              ? 'Completed'
              : nextStep
                ? nextSendIsDue
                  ? `Ready S${nextStep}`
                  : `Waiting S${nextStep}`
                : 'Completed';

        if (!isArchived) {
          if (!eligibleForOutreach || currentStep <= 0) funnel.notStarted += 1;
          else if (currentStep === 1) funnel.step1 += 1;
          else if (currentStep === 2) funnel.step2 += 1;
          else funnel.completed += 1;
        }

        const stepStatus = OUTREACH_STEPS.map(stepConfig => {
          const row = logsByStep.get(stepConfig.step);
          return {
            step: stepConfig.step,
            dayOffset: stepConfig.dayOffset,
            sent: Boolean(row),
            sentAt: row?.sent_at || null,
            openedAt: row?.opened_at || null,
            clickedAt: row?.clicked_at || null,
            bounced: Boolean(row?.bounced),
            resendId: row?.resend_id || null,
          };
        });

        const country =
          leadByCreatedDesc.find(row => Boolean(row.country))?.country ||
          canonicalLead.country ||
          null;
        const channel =
          leadByCreatedDesc.find(row => Boolean(row.channel))?.channel ||
          canonicalLead.channel ||
          null;

        return {
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
          id: canonicalLead.id,
          email,
          source: canonicalLead.source || 'unknown',
          channel,
          country,
          createdAt,
          batchKey: batch.key,
          batchStart: batch.startIso,
          batchEnd: batch.endIso,
          archived: isArchived,
          eligibleForOutreach,
          hasBounced,
          state,
          currentStep,
          lastSentAt:
            emailStepLogs.length > 0
              ? [...emailStepLogs].sort((a, b) =>
                  a.sent_at.localeCompare(b.sent_at)
                )[emailStepLogs.length - 1]?.sent_at || null
              : null,
          nextStep,
          nextSendAt,
          nextSendIsDue,
          statusLabel,
          stepStatus,
        };
      }
    );

    const batchMap = new Map<
      string,
      {
        key: string;
        startIso: string | null;
        endIso: string | null;
        total: number;
        due: number;
        waiting: number;
        completed: number;
        archived: number;
        bounced: number;
      }
    >();

    for (const lead of leadRows) {
      const key = (lead as any).batchKey || 'all';
      const existing = batchMap.get(key) || {
        key,
        startIso: (lead as any).batchStart || null,
        endIso: (lead as any).batchEnd || null,
        total: 0,
        due: 0,
        waiting: 0,
        completed: 0,
        archived: 0,
        bounced: 0,
      };
      existing.total += 1;
      if (lead.state === 'archived') existing.archived += 1;
      else if (lead.state === 'bounced') existing.bounced += 1;
      else if (lead.state === 'completed') existing.completed += 1;
      else if (lead.state === 'due') existing.due += 1;
      else existing.waiting += 1;
      batchMap.set(key, existing);
    }

    const batches = Array.from(batchMap.values()).sort((a, b) => {
      // prelaunch first, then weekly ascending by index, then all.
      if (a.key === 'prelaunch' && b.key !== 'prelaunch') return -1;
      if (b.key === 'prelaunch' && a.key !== 'prelaunch') return 1;
      if (a.key === 'all' && b.key !== 'all') return 1;
      if (b.key === 'all' && a.key !== 'all') return -1;
      const aIdx = a.key.startsWith('w') ? Number(a.key.slice(1)) : 999999;
      const bIdx = b.key.startsWith('w') ? Number(b.key.slice(1)) : 999999;
      return aIdx - bIdx;
    });

    const totalSent = emailLogs.length;
    const totalOpened = emailLogs.filter(log => Boolean(log.opened_at)).length;
    const totalClicked = emailLogs.filter(log =>
      Boolean(log.clicked_at)
    ).length;
    const totalBounced = emailLogs.filter(log => Boolean(log.bounced)).length;
    const overdueLeads = leadRows.filter(
      lead => lead.eligibleForOutreach && !lead.archived && lead.nextSendIsDue
    ).length;

    const rate = (part: number, whole: number) => {
      if (whole <= 0) return 0;
      return Math.round((part / whole) * 1000) / 10;
    };

    return NextResponse.json({
      automation: {
        paused: automation.paused,
        batching: automation.batching,
      },
      batches,
      summary: {
        totalLeads: leadRows.length,
        activeLeads: leadRows.filter(lead => !lead.archived).length,
        outreachEligibleLeads: leadRows.filter(
          lead => lead.eligibleForOutreach && !lead.archived
        ).length,
        totalSent,
        funnel,
        steps,
        timeline,
        health: {
          sendSuccessRate: rate(totalSent - totalBounced, totalSent),
          bounceRate: rate(totalBounced, totalSent),
          openRate: rate(totalOpened, totalSent),
          clickRate: rate(totalClicked, totalSent),
          overdueLeads,
        },
      },
      leads: leadRows,
    });
  } catch (err) {
    console.error('Outreach data error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
