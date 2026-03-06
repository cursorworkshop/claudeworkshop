#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

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

const linkedinClientId = process.env.LINKEDIN_CLIENT_ID || '';
const linkedinAccessTokenFromEnv = process.env.LINKEDIN_ACCESS_TOKEN || '';
const linkedinRefreshToken = process.env.LINKEDIN_REFRESH_TOKEN || '';
const linkedinOrganizationUrn = process.env.LINKEDIN_ORGANIZATION_URN || '';
const linkedinApiBaseUrl = (
  process.env.LINKEDIN_API_BASE_URL || 'https://api.linkedin.com'
).replace(/\/+$/, '');
const linkedinApiVersion = process.env.LINKEDIN_API_VERSION || '202602';
const requiredLinkedinOrganizationUrn = 'urn:li:organization:108842408';
const requiredLinkedinClientId = '775wbb9ubr5s2x';

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

const readJson = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
        };
      }
    } catch (error) {
      lastStatus = error instanceof Error ? error.message : String(error);
    }
    await sleep(waitIntervalMs);
  }

  throw new Error(
    `Research URL did not become live in time (${waitTimeoutMs}ms). Last status: ${lastStatus}`
  );
};

const assertLinkedInOrgOnlyPolicy = () => {
  const actualClientId = String(linkedinClientId || '').trim();
  if (!actualClientId) {
    throw new Error('LINKEDIN_CLIENT_ID is required for org-only posting.');
  }
  if (actualClientId !== requiredLinkedinClientId) {
    throw new Error(
      `LINKEDIN_CLIENT_ID MUST BE EXACTLY ${requiredLinkedinClientId}. Refusing to run with any other LinkedIn app.`
    );
  }
  if (String(linkedinRefreshToken || '').trim()) {
    throw new Error(
      'LINKEDIN_REFRESH_TOKEN IS DISABLED FOR SAFETY IN THIS PIPELINE. Use only LINKEDIN_ACCESS_TOKEN from the locked org app.'
    );
  }
};

const ensureLinkedInAccessToken = async () => {
  const accessToken = String(linkedinAccessTokenFromEnv || '').trim();
  if (accessToken) {
    return accessToken;
  }
  throw new Error(
    'Missing LINKEDIN_ACCESS_TOKEN. This pipeline does not allow refresh-token fallback for safety.'
  );
};

const normalizeOrganizationUrn = value => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('urn:li:organization:')) return raw;
  if (raw.startsWith('urn:li:person:')) {
    throw new Error(
      'PERSONAL LINKEDIN POSTING IS FORBIDDEN. Configure LINKEDIN_ORGANIZATION_URN.'
    );
  }
  if (raw.startsWith('urn:')) {
    throw new Error(
      `Unsupported LinkedIn author URN (${raw}). Expected urn:li:organization:<id>.`
    );
  }
  if (/^\d+$/.test(raw)) return `urn:li:organization:${raw}`;

  throw new Error(
    `Invalid LINKEDIN_ORGANIZATION_URN value (${raw}). Use a numeric id or full urn:li:organization:<id>.`
  );
};

const resolveLinkedInAuthorUrn = () => {
  assertLinkedInOrgOnlyPolicy();
  const urn = normalizeOrganizationUrn(linkedinOrganizationUrn);
  if (!urn) {
    throw new Error(
      'LINKEDIN_ORGANIZATION_URN IS REQUIRED. PERSONAL LINKEDIN POSTING IS FORBIDDEN.'
    );
  }
  if (urn !== requiredLinkedinOrganizationUrn) {
    throw new Error(
      `LINKEDIN_ORGANIZATION_URN MUST BE EXACTLY ${requiredLinkedinOrganizationUrn}. Refusing to post to any other author. PERSONAL LINKEDIN POSTING IS FORBIDDEN.`
    );
  }
  return urn;
};

const postToLinkedIn = async ({
  accessToken,
  authorUrn,
  text,
  articleUrl,
  articleTitle,
  articleDescription,
}) => {
  const response = await fetch(`${linkedinApiBaseUrl}/rest/posts`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': linkedinApiVersion,
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        article: {
          source: articleUrl,
          title: articleTitle || 'Claude Workshop Research',
          description: articleDescription || '',
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (
      response.status === 400 &&
      body.includes(
        'Organization permissions must be used when using organization as author'
      )
    ) {
      throw new Error(
        `LinkedIn organization permissions missing for ${authorUrn}. Re-authorize the app with organization scopes (at minimum w_organization_social) using a member who is an admin of this organization. PERSONAL LINKEDIN POSTING IS FORBIDDEN.`
      );
    }
    throw new Error(
      `LinkedIn publish failed (${response.status}): ${body.slice(0, 500)}`
    );
  }

  const payload = await response.json().catch(() => ({}));
  const headerUrn = response.headers.get('x-restli-id');
  const rawUrn = String(payload.id || headerUrn || '').trim();
  const postUrn = rawUrn ? decodeURIComponent(rawUrn) : '';
  const postUrl = postUrn
    ? `https://www.linkedin.com/feed/update/${postUrn}/`
    : '';

  return {
    postUrn,
    postUrl,
  };
};

const escapeHtml = input =>
  String(input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const sendSummaryEmail = async ({
  datetimeIso,
  xBookmarkUrl,
  articleUrl,
  linkedinUrl,
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
  const html = [
    `<p>Article and LI posted on ${escapeHtml(datetimeIso)}</p>`,
    '<ul>',
    `  <li>X bookmark used: <a href="${escapeHtml(xBookmarkUrl)}">${escapeHtml(xBookmarkUrl)}</a></li>`,
    `  <li>Research page: <a href="${escapeHtml(articleUrl)}">${escapeHtml(articleUrl)}</a></li>`,
    `  <li>Linkedin: <a href="${escapeHtml(linkedinUrl)}">${escapeHtml(linkedinUrl)}</a></li>`,
    `  <li>cost it took to generate all of this ${escapeHtml(costLine)}</li>`,
    '</ul>',
  ].join('\n');

  const text = [
    `Article and LI posted on ${datetimeIso}`,
    '',
    `- X bookmark used: ${xBookmarkUrl}`,
    `- Research page: ${articleUrl}`,
    `- Linkedin: ${linkedinUrl}`,
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
      subject: `Research automation posted: ${slug}`,
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
  const linkedinPath = path.join(packageDir, 'linkedin.txt');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing package manifest: ${manifestPath}`);
  }
  if (!fs.existsSync(linkedinPath)) {
    throw new Error(`Missing linkedin snippet: ${linkedinPath}`);
  }

  const manifest = readJson(manifestPath);
  const slug = String(manifest.slug || '').trim();
  const articleUrl = String(manifest.article_url || '').trim();
  const articleTitle = String(manifest.title || '').trim();
  const articleDescription = String(
    manifest.summary || manifest.description || ''
  ).trim();
  const xBookmarkUrl = String(manifest?.candidate?.status_url || '').trim();
  const estimatedCostUsd = Number(
    manifest?.usage?.estimated_total_cost_usd || 0
  );
  const linkedinText = fs.readFileSync(linkedinPath, 'utf8').trim();

  if (!slug) throw new Error('Manifest missing slug.');
  if (!articleUrl) throw new Error('Manifest missing article_url.');
  if (!xBookmarkUrl) throw new Error('Manifest missing candidate.status_url.');
  if (!linkedinText) throw new Error('linkedin.txt is empty.');

  if (!dryRun && !skipLiveCheck) {
    console.log(`Waiting for live research URL: ${articleUrl}`);
    await waitUntilLive(articleUrl);
  }

  const datetimeIso = new Date().toISOString();
  let linkedin = {
    postUrn: '',
    postUrl: '',
  };
  let email = {
    id: null,
  };

  if (!dryRun) {
    const accessToken = await ensureLinkedInAccessToken();
    const authorUrn = resolveLinkedInAuthorUrn();
    linkedin = await postToLinkedIn({
      accessToken,
      authorUrn,
      text: linkedinText,
      articleUrl,
      articleTitle,
      articleDescription,
    });
    if (!linkedin.postUrl) {
      throw new Error(
        'LinkedIn returned no post URL/URN. Aborting before email notification.'
      );
    }

    email = await sendSummaryEmail({
      datetimeIso,
      xBookmarkUrl,
      articleUrl,
      linkedinUrl: linkedin.postUrl,
      costUsd: estimatedCostUsd,
      slug,
    });
  }

  const distributionReport = {
    distributed_at: datetimeIso,
    dry_run: dryRun,
    slug,
    article_url: articleUrl,
    x_bookmark_url: xBookmarkUrl,
    estimated_total_cost_usd: Number(estimatedCostUsd.toFixed(6)),
    linkedin_post_urn: linkedin.postUrn || null,
    linkedin_post_url: linkedin.postUrl || null,
    resend_email_id: email.id || null,
    notified_recipients: notifyEmails,
  };

  writeJson(path.join(packageDir, 'distribution.json'), distributionReport);

  console.log(`Distributed slug: ${slug}`);
  console.log(`Research URL: ${articleUrl}`);
  console.log(
    `LinkedIn URL: ${distributionReport.linkedin_post_url || '(dry run)'}`
  );
  console.log(
    `Notification email id: ${distributionReport.resend_email_id || '(dry run)'}`
  );
};

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[distribution-error] ${message}`);
  process.exitCode = 1;
});
