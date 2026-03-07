#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_MAX_PAGES = 100;
const DEFAULT_TOP_N = 20;

const argv = process.argv.slice(2);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const RESEARCH_DIR = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_OUTPUT_DIR = path.join(RESEARCH_DIR, 'data', 'live');

const getArgValue = (name, fallback) => {
  const idx = argv.findIndex(arg => arg === name);
  if (idx === -1) return fallback;
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const outputDir = path.resolve(getArgValue('--out-dir', DEFAULT_OUTPUT_DIR));
const birdCmd = getArgValue('--bird-cmd', process.env.BIRD_CMD || 'bird');
const maxPages = Math.max(
  1,
  Number.parseInt(getArgValue('--max-pages', String(DEFAULT_MAX_PAGES)), 10) ||
    DEFAULT_MAX_PAGES
);
const topN = Math.max(
  1,
  Number.parseInt(getArgValue('--top', String(DEFAULT_TOP_N)), 10) ||
    DEFAULT_TOP_N
);

const RAW_JSON_PATH = path.join(outputDir, 'X-bookmarks.live.raw.json');
const SCORED_JSON_PATH = path.join(outputDir, 'X-bookmarks.live.scored.json');
const SCORED_CSV_PATH = path.join(outputDir, 'X-bookmarks.live.scored.csv');
const TOP_JSON_PATH = path.join(outputDir, 'X-bookmarks.live.top20-prep.json');
const TOP_CSV_PATH = path.join(outputDir, 'X-bookmarks.live.top20-prep.csv');
const SUMMARY_JSON_PATH = path.join(outputDir, 'X-bookmarks.live.summary.json');
const LAST_KNOWN_GOOD_SCORED_JSON_PATH = path.join(
  RESEARCH_DIR,
  'data',
  'state',
  'X-bookmarks.last-known-good.scored.json'
);

const csvEscape = input => {
  const value = input == null ? '' : String(input);
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const safeDate = input => {
  const ms = Date.parse(input || '');
  return Number.isFinite(ms) ? ms : 0;
};

const scoreRelevance = text => {
  const body = (text || '').toLowerCase();
  let score = 20;

  const weightedPositives = [
    { pattern: /\bagent(ic)?\b/g, points: 10 },
    { pattern: /\bmulti[- ]agent\b/g, points: 12 },
    { pattern: /\borchestrat(e|ion|or)\b/g, points: 9 },
    { pattern: /\bcursor\b/g, points: 8 },
    { pattern: /\bcodex\b/g, points: 8 },
    { pattern: /\bclaude code\b/g, points: 8 },
    { pattern: /\bopenai|anthropic\b/g, points: 5 },
    { pattern: /\bgithub\b/g, points: 5 },
    { pattern: /\bmcp\b/g, points: 8 },
    { pattern: /\bllm\b/g, points: 6 },
    { pattern: /\bprompt(s|ing)?\b/g, points: 5 },
    { pattern: /\beval(s|uation)?\b/g, points: 7 },
    { pattern: /\bbenchmark(s)?\b/g, points: 7 },
    { pattern: /\bcode(base)?\b/g, points: 5 },
    { pattern: /\bci\b|\btest(s|ing)?\b|\bobservability\b/g, points: 5 },
    { pattern: /\bdeveloper productivity\b|\bengineering team\b/g, points: 6 },
  ];

  const weightedNegatives = [
    { pattern: /\bcelebrity|movie|fashion|gossip\b/g, points: -18 },
    { pattern: /\bsports|football|soccer|nba|f1\b/g, points: -18 },
    { pattern: /\bpolitics|election|government\b/g, points: -12 },
    { pattern: /\bgiveaway|airdrop\b/g, points: -16 },
    { pattern: /\bmeme\b/g, points: -8 },
  ];

  for (const rule of weightedPositives) {
    const count = (body.match(rule.pattern) || []).length;
    score += count * rule.points;
  }
  for (const rule of weightedNegatives) {
    const count = (body.match(rule.pattern) || []).length;
    score += count * rule.points;
  }

  if (/\bgithub\.com|arxiv\.org|docs\./.test(body)) score += 10;
  if (body.length > 240) score += 4;
  if (body.length < 60) score -= 6;

  score = Math.max(0, Math.min(100, score));

  let reason = 'Low alignment with agentic-coding audience.';
  if (score >= 80)
    reason = 'Strong match for agentic coding and team workflows.';
  else if (score >= 65)
    reason = 'Good match with practical AI coding relevance.';
  else if (score >= 50)
    reason = 'Partial match; likely needs a tighter engineering angle.';

  return { score, reason };
};

const classifyTopic = text => {
  const t = (text || '').toLowerCase();
  if (/\bmulti[- ]agent|orchestrat/.test(t)) return 'multi-agent orchestration';
  if (/\bmcp|model context protocol/.test(t)) return 'mcp and integrations';
  if (/\beval|benchmark/.test(t)) return 'evals and measurement';
  if (/\bcursor|codex|claude code/.test(t)) return 'ai coding tooling';
  if (/\bworkflow|process|team|adoption/.test(t)) return 'team workflow design';
  if (/\barchitecture|codebase/.test(t)) return 'codebase architecture';
  return 'agentic coding signals';
};

const toStatusUrl = row =>
  `https://x.com/${row.author?.username || 'i'}/status/${row.id}`;

const slugify = input =>
  (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const firstSentence = input => {
  const value = (input || '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  const first = value.split(/[.!?]\s+/)[0] || value;
  return first.slice(0, 180);
};

const buildTopPrepRow = item => {
  const topic = classifyTopic(item.text);
  const seed = firstSentence(item.text);
  const slug = slugify(`${topic}-${item.id}`).slice(0, 72);
  return {
    id: item.id,
    status_url: item.status_url,
    author_handle: item.author_handle,
    created_at: item.created_at,
    'relevance %': item['relevance %'],
    fit_for_agentic_coders: item['relevance %'] >= 65 ? 'yes' : 'no',
    candidate_slug: slug,
    article_working_title: `What ${topic} changes for teams shipping with coding agents`,
    core_angle:
      seed || 'Use this post as a proof point for a real workflow shift.',
    image_prompt_draft:
      'Single developer seated at one desk in three-quarter back profile, focused on one monitor with subtle abstract cues of agent orchestration. No extra people.',
    humanizer_notes:
      'Keep the voice direct and specific. Avoid buzzword-heavy phrasing and generic grand claims.',
  };
};

const writeCsv = (targetPath, rows, headers) => {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => csvEscape(row[h])).join(','));
  }
  fs.writeFileSync(targetPath, `${lines.join('\n')}\n`, 'utf8');
};

const fetchAllBookmarks = () => {
  const command = `${birdCmd} bookmarks --all --max-pages ${maxPages} --json`;
  const stdout = execSync(command, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256,
  });
  const parsed = JSON.parse(stdout);
  if (!Array.isArray(parsed)) {
    throw new Error('Expected an array from bird bookmarks --json output.');
  }
  return parsed;
};

const main = () => {
  fs.mkdirSync(outputDir, { recursive: true });

  const fetched = fetchAllBookmarks();

  const dedupMap = new Map();
  for (const row of fetched) {
    if (row?.id) dedupMap.set(row.id, row);
  }

  const deduped = [...dedupMap.values()].sort(
    (a, b) => safeDate(b.createdAt) - safeDate(a.createdAt)
  );

  const scoredRows = deduped.map(row => {
    const text = (row.text || '').replace(/\s+/g, ' ').trim();
    const scoringText = `${text} ${row.author?.username || ''}`;
    const { score, reason } = scoreRelevance(scoringText);
    const topic = classifyTopic(scoringText);
    return {
      id: row.id || '',
      status_url: toStatusUrl(row),
      author_handle: row.author?.username || '',
      author_name: row.author?.name || '',
      created_at: row.createdAt || '',
      text,
      replies: row.replyCount ?? 0,
      reposts: row.retweetCount ?? 0,
      likes: row.likeCount ?? 0,
      conversation_id: row.conversationId || '',
      'relevance %': score,
      relevance_reason: reason,
      topic,
      fit_for_agentic_coders: score >= 65 ? 'yes' : 'no',
      source: 'bird_cli_bookmarks',
    };
  });

  const ranked = [...scoredRows].sort(
    (a, b) =>
      b['relevance %'] - a['relevance %'] ||
      safeDate(b.created_at) - safeDate(a.created_at)
  );

  const topRows = ranked.slice(0, topN).map(buildTopPrepRow);

  fs.writeFileSync(
    RAW_JSON_PATH,
    `${JSON.stringify(deduped, null, 2)}\n`,
    'utf8'
  );
  fs.writeFileSync(
    SCORED_JSON_PATH,
    `${JSON.stringify(scoredRows, null, 2)}\n`,
    'utf8'
  );
  fs.mkdirSync(path.dirname(LAST_KNOWN_GOOD_SCORED_JSON_PATH), {
    recursive: true,
  });
  fs.writeFileSync(
    LAST_KNOWN_GOOD_SCORED_JSON_PATH,
    `${JSON.stringify(scoredRows, null, 2)}\n`,
    'utf8'
  );
  fs.writeFileSync(
    TOP_JSON_PATH,
    `${JSON.stringify(topRows, null, 2)}\n`,
    'utf8'
  );

  writeCsv(SCORED_CSV_PATH, scoredRows, [
    'id',
    'status_url',
    'author_handle',
    'author_name',
    'created_at',
    'text',
    'replies',
    'reposts',
    'likes',
    'conversation_id',
    'relevance %',
    'relevance_reason',
    'topic',
    'fit_for_agentic_coders',
    'source',
  ]);

  writeCsv(TOP_CSV_PATH, topRows, [
    'id',
    'status_url',
    'author_handle',
    'created_at',
    'relevance %',
    'fit_for_agentic_coders',
    'candidate_slug',
    'article_working_title',
    'core_angle',
    'image_prompt_draft',
    'humanizer_notes',
  ]);

  const summary = {
    generated_at: new Date().toISOString(),
    max_pages_requested: maxPages,
    total_fetched: fetched.length,
    total_unique: deduped.length,
    total_scored: scoredRows.length,
    top_count: topRows.length,
    files: {
      raw_json: path.relative(RESEARCH_DIR, RAW_JSON_PATH),
      scored_json: path.relative(RESEARCH_DIR, SCORED_JSON_PATH),
      last_known_good_scored_json: path.relative(
        RESEARCH_DIR,
        LAST_KNOWN_GOOD_SCORED_JSON_PATH
      ),
      scored_csv: path.relative(RESEARCH_DIR, SCORED_CSV_PATH),
      top_json: path.relative(RESEARCH_DIR, TOP_JSON_PATH),
      top_csv: path.relative(RESEARCH_DIR, TOP_CSV_PATH),
    },
  };

  fs.writeFileSync(
    SUMMARY_JSON_PATH,
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8'
  );

  console.log(`Fetched bookmarks: ${summary.total_fetched}`);
  console.log(`Unique bookmarks: ${summary.total_unique}`);
  console.log(`Scored JSON: ${SCORED_JSON_PATH}`);
  console.log(`Scored CSV: ${SCORED_CSV_PATH}`);
  console.log(`Top${topN} JSON: ${TOP_JSON_PATH}`);
  console.log(`Top${topN} CSV: ${TOP_CSV_PATH}`);
  console.log(`Summary: ${SUMMARY_JSON_PATH}`);
};

main();
