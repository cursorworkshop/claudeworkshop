import { createClient } from '@supabase/supabase-js';

export type OutreachAutomationConfig = {
  paused: boolean;
  batching?: {
    enabled: boolean;
    // ISO timestamp for when batching starts. Leads with startedAt < launchCutoffIso
    // are grouped into the prelaunch batch.
    launchCutoffIso: string;
    windowDays: number;
  };
};

const BUCKET = 'app-config';
const OBJECT_PATH = 'outreach/config.json';
const CACHE_TTL_MS = 10_000;

let cache: { loadedAt: number; value: OutreachAutomationConfig } | null = null;

function startOfUtcDayIso(date: Date) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  return d.toISOString();
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureBucket(
  supabase: ReturnType<typeof createClient<any>>
): Promise<void> {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`Failed to list storage buckets: ${error.message}`);
  }

  if ((buckets || []).some(bucket => bucket.name === BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: false,
  });

  if (createError) {
    throw new Error(`Failed to create storage bucket: ${createError.message}`);
  }
}

function normalizeConfig(value: unknown): OutreachAutomationConfig {
  if (!value || typeof value !== 'object') {
    return {
      paused: false,
      batching: {
        enabled: true,
        // Freeze a stable default at the moment batching is first initialized.
        launchCutoffIso: new Date().toISOString(),
        windowDays: 7,
      },
    };
  }
  const paused =
    typeof (value as any).paused === 'boolean' ? (value as any).paused : false;

  const rawBatching = (value as any).batching;
  const enabled =
    rawBatching && typeof rawBatching.enabled === 'boolean'
      ? rawBatching.enabled
      : true;
  const windowDays =
    rawBatching && Number.isFinite(rawBatching.windowDays)
      ? Math.max(1, Math.floor(Number(rawBatching.windowDays)))
      : 7;

  let launchCutoffIso: string = new Date().toISOString();
  if (rawBatching && typeof rawBatching.launchCutoffIso === 'string') {
    const parsed = new Date(rawBatching.launchCutoffIso);
    if (!Number.isNaN(parsed.getTime())) {
      launchCutoffIso = parsed.toISOString();
    }
  }

  return {
    paused,
    batching: {
      enabled,
      launchCutoffIso,
      windowDays,
    },
  };
}

async function downloadConfig(
  supabase: ReturnType<typeof createClient<any>>
): Promise<{
  config: OutreachAutomationConfig;
  found: boolean;
  raw: unknown | null;
}> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(OBJECT_PATH);
  if (error || !data) {
    return { config: normalizeConfig(null), found: false, raw: null };
  }

  try {
    const buffer = Buffer.from(await data.arrayBuffer());
    const raw = buffer.toString('utf8');
    const parsed = JSON.parse(raw) as unknown;
    return { config: normalizeConfig(parsed), found: true, raw: parsed };
  } catch {
    return { config: normalizeConfig(null), found: false, raw: null };
  }
}

async function uploadConfig(
  supabase: ReturnType<typeof createClient<any>>,
  config: OutreachAutomationConfig
): Promise<void> {
  const payload = {
    version: 2,
    paused: Boolean(config.paused),
    batching: config.batching
      ? {
          enabled: Boolean(config.batching.enabled),
          launchCutoffIso: String(config.batching.launchCutoffIso),
          windowDays: Number(config.batching.windowDays),
        }
      : undefined,
  };
  const file = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(OBJECT_PATH, file, {
      upsert: true,
      contentType: 'application/json',
    });

  if (error) {
    throw new Error(`Failed to upload outreach config: ${error.message}`);
  }
}

export async function getOutreachAutomationConfig(options?: {
  bypassCache?: boolean;
}): Promise<OutreachAutomationConfig> {
  const bypassCache = options?.bypassCache === true;
  if (!bypassCache && cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache.value;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { paused: false };

  await ensureBucket(supabase);
  const { config: value, found, raw } = await downloadConfig(supabase);

  // Persist a stable config once so batch cutoffs don't "move" between restarts,
  // including when upgrading from older config shapes.
  const rawBatching =
    raw && typeof raw === 'object' ? (raw as any).batching : undefined;
  const hasStableBatching =
    rawBatching && typeof rawBatching.launchCutoffIso === 'string';

  if (!found || !hasStableBatching) {
    await uploadConfig(supabase, value);
  }

  cache = { loadedAt: Date.now(), value };
  return value;
}

export async function setOutreachAutomationConfig(
  next: Partial<OutreachAutomationConfig>
): Promise<OutreachAutomationConfig> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  await ensureBucket(supabase);

  const { config: current } = await downloadConfig(supabase);
  const merged: OutreachAutomationConfig = normalizeConfig({
    ...current,
    ...next,
    batching: {
      ...(current.batching || normalizeConfig(null).batching),
      ...((next as any).batching || {}),
    },
  });

  const value = merged;
  await uploadConfig(supabase, value);
  cache = { loadedAt: Date.now(), value };
  return value;
}
