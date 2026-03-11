#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);

const getArgValue = (name, fallback = '') => {
  const idx = argv.findIndex(arg => arg === name);
  if (idx === -1) return fallback;
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const reportPath = path.resolve(getArgValue('--report', ''));
const resendApiKey = process.env.RESEND_API_KEY || '';
const notifyFrom =
  process.env.RESEARCH_NOTIFY_FROM ||
  'Claude Workshop <info@claudeworkshop.com>';
const notifyReplyTo =
  process.env.RESEARCH_NOTIFY_REPLY_TO || 'info@claudeworkshop.com';
const notifyEmails = (process.env.RESEARCH_NOTIFY_EMAILS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

if (!reportPath || !fs.existsSync(reportPath)) {
  throw new Error(`Missing preflight report: ${reportPath}`);
}

if (!resendApiKey) {
  throw new Error('Missing RESEND_API_KEY.');
}

if (notifyEmails.length === 0) {
  throw new Error('No recipients configured in RESEARCH_NOTIFY_EMAILS.');
}

const report = fs.readFileSync(reportPath, 'utf8').trim();
const runUrl =
  process.env.GITHUB_SERVER_URL &&
  process.env.GITHUB_REPOSITORY &&
  process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : '';

const html = [
  '<p>The scheduled research preflight canary failed before the nightly shadow run.</p>',
  '<p>No research publish should follow from this scheduled path until the failure is fixed.</p>',
  runUrl ? `<p>GitHub Actions run: <a href="${runUrl}">${runUrl}</a></p>` : '',
  '<pre style="white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;">',
  report
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;'),
  '</pre>',
]
  .filter(Boolean)
  .join('\n');

const text = [
  'The scheduled research preflight canary failed before the nightly shadow run.',
  'No research publish should follow from this scheduled path until the failure is fixed.',
  runUrl ? `GitHub Actions run: ${runUrl}` : '',
  '',
  report,
]
  .filter(Boolean)
  .join('\n');

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
    subject: 'Research preflight canary failed',
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
process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
