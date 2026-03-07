#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_RESEARCH_SITE_BASE_URLS = [
  'https://www.claudeworkshop.com/research',
  'https://www.claudeworkshop.com/research',
  'https://www.codexworkshop.com/research',
];

const getArgValue = (name, fallback) => {
  const idx = argv.findIndex(arg => arg === name);
  if (idx === -1) return fallback;
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const hasFlag = name => argv.includes(name);

const stateJsonPath = path.resolve(
  getArgValue(
    '--state-json',
    path.join(PROJECT_ROOT, 'data', 'state', 'latest-publish.json')
  )
);
const outboxRoot = path.resolve(
  getArgValue('--outbox-root', path.join(PROJECT_ROOT, 'data', 'outbox'))
);
const packageDirOverride = getArgValue('--package-dir', '');
const waitTimeoutMs = Math.max(
  60_000,
  Number.parseInt(getArgValue('--wait-timeout-ms', '1800000'), 10) || 1_800_000
);
const waitIntervalMs = Math.max(
  5_000,
  Number.parseInt(getArgValue('--wait-interval-ms', '20000'), 10) || 20_000
);
const skipLiveCheck = hasFlag('--skip-live-check');
const dryRun = hasFlag('--dry-run');

const resendApiKey = process.env.RESEND_API_KEY || '';
const notifyFrom =
  process.env.RESEARCH_NOTIFY_FROM ||
  'Claude Workshop <info@claudeworkshop.com>';
const notifyEmails = (
  process.env.RESEARCH_NOTIFY_EMAILS ||
  'contact@rogyr.com,vasilis@vasilistsolis.com'
)
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const notifyReplyTo =
  process.env.RESEARCH_NOTIFY_REPLY_TO || 'info@claudeworkshop.com';
const researchSiteBaseUrls = (
  process.env.RESEARCH_SITE_BASE_URLS ||
  DEFAULT_RESEARCH_SITE_BASE_URLS.join(',')
)
  .split(',')
  .map(value => value.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const readJson = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const safeDate = input => {
  const ms = Date.parse(input || '');
  return Number.isFinite(ms) ? ms : 0;
};
const formatDuration = inputMs => {
  const totalSeconds = Math.max(0, Math.round((inputMs || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

const latestOutboxDir = () => {
  if (!fs.existsSync(outboxRoot)) return '';
  const dirs = fs
    .readdirSync(outboxRoot)
    .map(name => path.join(outboxRoot, name))
    .filter(full => fs.statSync(full).isDirectory())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return dirs[0] || '';
};

const resolvePackageDir = () => {
  if (packageDirOverride) return path.resolve(packageDirOverride);
  if (fs.existsSync(stateJsonPath)) {
    const state = readJson(stateJsonPath);
    if (state?.outbox_dir) {
      const fromState = path.resolve(PROJECT_ROOT, state.outbox_dir);
      if (fs.existsSync(fromState)) return fromState;
    }
  }
  return latestOutboxDir();
};

const waitUntilLive = async url => {
  const deadline = Date.now() + waitTimeoutMs;
  let lastStatus = 'unknown';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'user-agent': 'cursorworkshop-research-distributor/1.0',
        },
      });
      lastStatus = String(response.status);
      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          url,
        };
      }
    } catch (error) {
      lastStatus = error instanceof Error ? error.message : String(error);
    }
    await sleep(waitIntervalMs);
  }

  throw new Error(
    `Research URL did not become live in time (${waitTimeoutMs}ms): ${url}. Last status: ${lastStatus}`
  );
};

const escapeHtml = input =>
  String(input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const normalizeResearchUrl = value =>
  String(value || '')
    .trim()
    .replace(/\/+$/, '');

const buildResearchUrls = ({ articleUrl, slug }) => {
  const urls = new Set();
  const normalizedArticleUrl = normalizeResearchUrl(articleUrl);

  if (normalizedArticleUrl) {
    urls.add(normalizedArticleUrl);
  }

  for (const baseUrl of researchSiteBaseUrls) {
    if (!baseUrl) continue;
    const normalizedBaseUrl = normalizeResearchUrl(baseUrl);
    if (!normalizedBaseUrl) continue;

    const directMatch = normalizedBaseUrl.endsWith(`/${slug}`);
    urls.add(directMatch ? normalizedBaseUrl : `${normalizedBaseUrl}/${slug}`);
  }

  return Array.from(urls);
};

const sendSummaryEmail = async ({
  datetimeIso,
  pipelineStartedAt,
  liveVerifiedAt,
  totalTimeToLiveHuman,
  xBookmarkUrl,
  researchUrls,
  costUsd,
  slug,
}) => {
  if (!resendApiKey) {
    throw new Error('Missing RESEND_API_KEY.');
  }
  if (notifyEmails.length === 0) {
    throw new Error('No recipients configured in RESEARCH_NOTIFY_EMAILS.');
  }

  const costLine = `$${Number(costUsd || 0).toFixed(4)} (estimated from configured API pricing)`;
  const timingLine =
    pipelineStartedAt && liveVerifiedAt && totalTimeToLiveHuman
      ? `${totalTimeToLiveHuman} from pipeline start to live /research availability`
      : '';
  const html = [
    `<p>Research automation completed on ${escapeHtml(datetimeIso)}</p>`,
    '<ul>',
    `  <li>X bookmark used: <a href="${escapeHtml(xBookmarkUrl)}">${escapeHtml(xBookmarkUrl)}</a></li>`,
    ...researchUrls.map(
      url =>
        `  <li>Research page: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`
    ),
    ...(timingLine
      ? [
          `  <li>Total time to live: ${escapeHtml(timingLine)}</li>`,
          `  <li>Pipeline started: ${escapeHtml(pipelineStartedAt)}</li>`,
          `  <li>Live verification passed: ${escapeHtml(liveVerifiedAt)}</li>`,
        ]
      : []),
    `  <li>cost it took to generate all of this ${escapeHtml(costLine)}</li>`,
    '</ul>',
  ].join('\n');

  const text = [
    `Research automation completed on ${datetimeIso}`,
    '',
    `- X bookmark used: ${xBookmarkUrl}`,
    ...researchUrls.map(url => `- Research page: ${url}`),
    ...(timingLine
      ? [
          `- Total time to live: ${timingLine}`,
          `- Pipeline started: ${pipelineStartedAt}`,
          `- Live verification passed: ${liveVerifiedAt}`,
        ]
      : []),
    `- cost it took to generate all of this ${costLine}`,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${resendApiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: notifyFrom,
      to: notifyEmails,
      reply_to: notifyReplyTo,
      subject: `Research automation published: ${slug}`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Resend send failed (${response.status}): ${body.slice(0, 400)}`
    );
  }

  const payload = await response.json();
  return {
    id: payload?.id || null,
  };
};

const main = async () => {
  const packageDir = resolvePackageDir();
  if (!packageDir || !fs.existsSync(packageDir)) {
    throw new Error('No outbox package directory found for distribution step.');
  }

  const manifestPath = path.join(packageDir, 'package.json');
  const distributionPath = path.join(packageDir, 'distribution.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing package manifest: ${manifestPath}`);
  }

  const manifest = readJson(manifestPath);
  const priorDistribution = fs.existsSync(distributionPath)
    ? readJson(distributionPath)
    : null;
  const latestState = fs.existsSync(stateJsonPath) ? readJson(stateJsonPath) : {};
  const slug = String(manifest.slug || '').trim();
  const articleUrl = String(manifest.article_url || '').trim();
  const xBookmarkUrl = String(manifest?.candidate?.status_url || '').trim();
  const estimatedCostUsd = Number(
    manifest?.usage?.estimated_total_cost_usd || 0
  );
  const pipelineStartedAt = String(
    manifest.pipeline_started_at ||
      latestState?.pipeline_started_at ||
      manifest?.candidate?.generated_at ||
      ''
  ).trim();

  if (!slug) throw new Error('Manifest missing slug.');
  if (!articleUrl) throw new Error('Manifest missing article_url.');
  if (!xBookmarkUrl) throw new Error('Manifest missing candidate.status_url.');

  const researchUrls = buildResearchUrls({ articleUrl, slug });
  if (researchUrls.length === 0) {
    throw new Error('No research URLs were derived for live verification.');
  }

  if (!dryRun && !skipLiveCheck) {
    for (const url of researchUrls) {
      console.log(`Waiting for live research URL: ${url}`);
      await waitUntilLive(url);
    }
  }

  const priorLiveVerifiedAt = String(
    priorDistribution?.live_verified_at || ''
  ).trim();
  const liveVerifiedAt = priorLiveVerifiedAt || new Date().toISOString();
  const pipelineStartedAtMs = safeDate(pipelineStartedAt);
  const liveVerifiedAtMs = safeDate(liveVerifiedAt);
  const priorTotalTimeToLiveMs = Number.isFinite(
    Number(priorDistribution?.total_time_to_live_ms)
  )
    ? Number(priorDistribution.total_time_to_live_ms)
    : null;
  const computedTotalTimeToLiveMs =
    pipelineStartedAtMs > 0 && liveVerifiedAtMs >= pipelineStartedAtMs
      ? liveVerifiedAtMs - pipelineStartedAtMs
      : null;
  const totalTimeToLiveMs =
    priorTotalTimeToLiveMs != null && priorTotalTimeToLiveMs >= 0
      ? priorTotalTimeToLiveMs
      : computedTotalTimeToLiveMs;
  const totalTimeToLiveHuman =
    totalTimeToLiveMs == null ? '' : formatDuration(totalTimeToLiveMs);
  const datetimeIso = new Date().toISOString();
  let email = {
    id: null,
  };

  if (!dryRun) {
    email = await sendSummaryEmail({
      datetimeIso,
      pipelineStartedAt,
      liveVerifiedAt,
      totalTimeToLiveHuman,
      xBookmarkUrl,
      researchUrls,
      costUsd: estimatedCostUsd,
      slug,
    });
  }

  const distributionReport = {
    distributed_at: datetimeIso,
    dry_run: dryRun,
    slug,
    primary_article_url: articleUrl,
    research_urls: researchUrls,
    x_bookmark_url: xBookmarkUrl,
    pipeline_started_at: pipelineStartedAt || null,
    live_verified_at: liveVerifiedAt,
    total_time_to_live_ms: totalTimeToLiveMs,
    total_time_to_live_human: totalTimeToLiveHuman || null,
    estimated_total_cost_usd: Number(estimatedCostUsd.toFixed(6)),
    resend_email_id: email.id || null,
    notified_recipients: notifyEmails,
  };

  writeJson(path.join(packageDir, 'distribution.json'), distributionReport);

  console.log(`Distributed slug: ${slug}`);
  console.log(`Primary research URL: ${articleUrl}`);
  for (const url of researchUrls) {
    console.log(`Research URL: ${url}`);
  }
  console.log(
    `Notification email id: ${distributionReport.resend_email_id || '(dry run)'}`
  );
};

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[distribution-error] ${message}`);
  process.exitCode = 1;
});
