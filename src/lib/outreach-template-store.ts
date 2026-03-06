import { createClient } from '@supabase/supabase-js';

export type OutreachTemplateOverride = {
  subject: string;
  bodyHtml: string;
};

const BUCKET = 'app-config';
const OBJECT_PATH = 'outreach/templates.json';
const CACHE_TTL_MS = 30_000;

let cache: {
  loadedAt: number;
  value: Record<number, OutreachTemplateOverride>;
} | null = null;

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

async function downloadJson(
  supabase: ReturnType<typeof createClient<any>>
): Promise<Record<number, OutreachTemplateOverride>> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(OBJECT_PATH);

  if (error || !data) {
    return {};
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const raw = buffer.toString('utf8');

  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      templates?: Record<string, OutreachTemplateOverride>;
    };

    const templates = parsed?.templates || {};
    const out: Record<number, OutreachTemplateOverride> = {};
    for (const [key, value] of Object.entries(templates)) {
      const step = Number(key);
      if (!Number.isFinite(step) || step <= 0) continue;
      if (
        !value ||
        typeof value.subject !== 'string' ||
        typeof value.bodyHtml !== 'string'
      )
        continue;
      out[step] = {
        subject: value.subject,
        bodyHtml: value.bodyHtml,
      };
    }
    return out;
  } catch {
    return {};
  }
}

async function uploadJson(
  supabase: ReturnType<typeof createClient<any>>,
  overrides: Record<number, OutreachTemplateOverride>
): Promise<void> {
  const payload = {
    version: 1,
    templates: Object.fromEntries(
      Object.entries(overrides).map(([step, value]) => [
        String(step),
        { subject: value.subject, bodyHtml: value.bodyHtml },
      ])
    ),
  };

  const file = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(OBJECT_PATH, file, {
      upsert: true,
      contentType: 'application/json',
    });

  if (error) {
    throw new Error(`Failed to upload template overrides: ${error.message}`);
  }
}

export async function getOutreachTemplateOverrides(options?: {
  bypassCache?: boolean;
}): Promise<Record<number, OutreachTemplateOverride>> {
  const bypassCache = options?.bypassCache === true;
  if (!bypassCache && cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache.value;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return {};

  await ensureBucket(supabase);
  const overrides = await downloadJson(supabase);
  cache = { loadedAt: Date.now(), value: overrides };
  return overrides;
}

export async function setOutreachTemplateOverride(
  step: number,
  next: OutreachTemplateOverride
): Promise<void> {
  if (!Number.isFinite(step) || step <= 0) {
    throw new Error('Invalid step');
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  await ensureBucket(supabase);
  const overrides = await downloadJson(supabase);
  overrides[step] = { subject: next.subject, bodyHtml: next.bodyHtml };
  await uploadJson(supabase, overrides);
  cache = { loadedAt: Date.now(), value: overrides };
}

export async function resetOutreachTemplateOverride(
  step: number
): Promise<void> {
  if (!Number.isFinite(step) || step <= 0) {
    throw new Error('Invalid step');
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  await ensureBucket(supabase);
  const overrides = await downloadJson(supabase);
  if (overrides[step]) {
    delete overrides[step];
    await uploadJson(supabase, overrides);
  }
  cache = { loadedAt: Date.now(), value: overrides };
}
