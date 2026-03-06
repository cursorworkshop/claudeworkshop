#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const RESEARCH_DIR = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_INPUT = path.join(
  RESEARCH_DIR,
  'data',
  'export',
  'X-bookmarks.html'
);
const DEFAULT_OUTPUT = path.join(
  RESEARCH_DIR,
  'data',
  'legacy',
  'X-bookmarks.parsed.csv'
);
const DEFAULT_TOP_OUTPUT = path.join(
  RESEARCH_DIR,
  'data',
  'legacy',
  'X-bookmarks.top20-prep.csv'
);

const decodeHtmlEntities = input => {
  if (!input) return '';
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/\u00A0/g, ' ');
};

const cleanUrl = value =>
  decodeHtmlEntities(value || '')
    .replace(/&amp;/g, '&')
    .replace(/["')]+$/g, '')
    .trim();

const stripTags = input =>
  decodeHtmlEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );

const csvEscape = input => {
  const value = input == null ? '' : String(input);
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const parseCount = (label, noun) => {
  if (!label) return 0;
  const re = new RegExp(`([0-9][0-9.,]*)\\s+${noun}`, 'i');
  const match = label.match(re);
  if (!match) return 0;
  return Number(match[1].replace(/[.,](?=\d{3}\b)/g, '').replace(/,/g, ''));
};

const getBalancedDiv = (html, needle) => {
  const idx = html.indexOf(needle);
  if (idx === -1) return '';
  const openIdx = html.lastIndexOf('<div', idx);
  if (openIdx === -1) return '';
  let depth = 0;
  let i = openIdx;
  while (i < html.length) {
    const nextOpen = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + 4;
      continue;
    }
    if (nextClose !== -1) {
      depth -= 1;
      i = nextClose + 6;
      if (depth === 0) {
        return html.slice(openIdx, i);
      }
      continue;
    }
    break;
  }
  return '';
};

const scoreRelevance = text => {
  const body = (text || '').toLowerCase();

  let score = 18;

  const weightedPositives = [
    { pattern: /\bagent(ic)?\b/g, points: 10 },
    { pattern: /\bmulti[- ]agent\b/g, points: 12 },
    { pattern: /\borchestrat(e|ion|or)\b/g, points: 9 },
    { pattern: /\bcursor\b/g, points: 8 },
    { pattern: /\bcodex\b/g, points: 8 },
    { pattern: /\bclaude code\b/g, points: 8 },
    { pattern: /\bgithub\b/g, points: 5 },
    { pattern: /\bmcp\b/g, points: 8 },
    { pattern: /\bllm\b/g, points: 6 },
    { pattern: /\bprompt(s|ing)?\b/g, points: 5 },
    { pattern: /\beval(s|uation)?\b/g, points: 7 },
    { pattern: /\bbenchmark(s)?\b/g, points: 7 },
    { pattern: /\breview\b/g, points: 4 },
    { pattern: /\bdeployment|deploy\b/g, points: 4 },
    { pattern: /\bcode(base)?\b/g, points: 5 },
    { pattern: /\bengineering team|developer productivity\b/g, points: 6 },
  ];

  const weightedNegatives = [
    { pattern: /\bcelebrity|movie|fashion|gossip\b/g, points: -18 },
    { pattern: /\bsports|football|soccer|nba|f1\b/g, points: -18 },
    { pattern: /\bpolitics|election|government\b/g, points: -12 },
    { pattern: /\bcrypto pump|giveaway|airdrop\b/g, points: -16 },
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
  if (body.length > 240) score += 5;
  if (body.length < 60) score -= 6;

  score = Math.max(0, Math.min(100, score));

  let reason = 'Low alignment with agentic-coding audience.';
  if (score >= 80) reason = 'Strong match for agentic coding and team workflows.';
  else if (score >= 65)
    reason = 'Good match with practical AI coding relevance.';
  else if (score >= 50)
    reason = 'Partial match; needs tighter engineering angle.';

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

const buildPrepRow = item => {
  const topic = classifyTopic(item.text);
  const baseSlug = `${topic.replace(/[^a-z0-9]+/g, '-')}-${item.statusId}`.slice(
    0,
    64
  );
  const trimmedText = item.text.replace(/\s+/g, ' ').trim();
  const firstSentence = (trimmedText.split(/[.!?]\s+/)[0] || trimmedText).slice(
    0,
    180
  );
  return {
    status_url: item.statusUrl,
    author_handle: item.authorHandle,
    'relevance %': item.relevancePercent,
    fit_for_agentic_coders: item.relevancePercent >= 65 ? 'yes' : 'no',
    candidate_slug: baseSlug.replace(/^-+|-+$/g, ''),
    article_working_title: `What ${topic} changes for agentic coding teams`,
    core_angle: firstSentence || 'Use this post as a proof point for a practical workflow shift.',
    linkedin_hook_draft: `Most teams are seeing this signal now: ${firstSentence.slice(
      0,
      120
    )}... Full breakdown on our research page.`,
    evidence_checklist:
      'Verify original thread, linked source docs, concrete implementation details, and limits.',
  };
};

const extractTweets = html => {
  const articles = [];
  const articleRegex = /<article[^>]*data-testid="tweet"[^>]*>([\s\S]*?)<\/article>/gi;
  let m;
  while ((m = articleRegex.exec(html)) !== null) {
    articles.push(m[0]);
  }

  const seen = new Set();
  const rows = [];

  for (const article of articles) {
    const statusMatch = article.match(
      /https:\/\/x\.com\/([A-Za-z0-9_]+)\/status\/([0-9]+)/i
    );
    if (!statusMatch) continue;
    const statusUrl = `https://x.com/${statusMatch[1]}/status/${statusMatch[2]}`;
    if (seen.has(statusUrl)) continue;
    seen.add(statusUrl);

    const authorHandle = statusMatch[1];
    const statusId = statusMatch[2];
    const dateMatch = article.match(/<time[^>]*datetime="([^"]+)"/i);
    const postedAt = dateMatch ? dateMatch[1] : '';

    const textBlock = getBalancedDiv(article, 'data-testid="tweetText"');
    const text = stripTags(textBlock);

    const hrefs = [...article.matchAll(/href="(https:\/\/[^"]+)"/g)]
      .map(match => cleanUrl(match[1]))
      .filter(link => !/\/analytics$/.test(link))
      .filter(link => !/\/photo\/\d+$/.test(link))
      .filter(link => !/\/video\/\d+$/.test(link))
      .filter(link => link !== statusUrl);

    const dedupLinks = [...new Set(hrefs)];
    const externalLinks = dedupLinks.filter(link => !link.startsWith('https://x.com/'));

    const mediaUrls = [
      ...new Set(
        [...article.matchAll(/https:\/\/pbs\.twimg\.com\/media\/[^"')\s]+/g)].map(
          match => cleanUrl(match[0])
        )
      ),
    ];

    const metricsLabelMatch = article.match(/aria-label="([^"]*replies[^"]*)"/i);
    const metricsLabel = metricsLabelMatch
      ? decodeHtmlEntities(metricsLabelMatch[1])
      : '';

    const replies = parseCount(metricsLabel, 'repl(?:y|ies)');
    const reposts = parseCount(metricsLabel, 'reposts?');
    const likes = parseCount(metricsLabel, 'likes?');
    const bookmarks = parseCount(metricsLabel, 'bookmarks?');
    const views = parseCount(metricsLabel, 'views?');

    const scoringText = [text, ...externalLinks].join(' ');
    const { score, reason } = scoreRelevance(scoringText);

    rows.push({
      statusId,
      statusUrl,
      authorHandle,
      postedAt,
      text,
      replies,
      reposts,
      likes,
      bookmarks,
      views,
      externalLinks: externalLinks.join(' | '),
      mediaUrls: mediaUrls.join(' | '),
      'relevance %': score,
      relevancePercent: score,
      relevanceReason: reason,
    });
  }

  return rows;
};

const toCsv = (rows, columns) => {
  const lines = [columns.join(',')];
  for (const row of rows) {
    lines.push(columns.map(col => csvEscape(row[col])).join(','));
  }
  return `${lines.join('\n')}\n`;
};

const run = () => {
  const input = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_INPUT;
  const output = process.argv[3]
    ? path.resolve(process.argv[3])
    : DEFAULT_OUTPUT;
  const topOutput = process.argv[4]
    ? path.resolve(process.argv[4])
    : DEFAULT_TOP_OUTPUT;

  if (!fs.existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(1);
  }

  const html = fs.readFileSync(input, 'utf8');
  const parsed = extractTweets(html);
  const sorted = [...parsed].sort(
    (a, b) => b.relevancePercent - a.relevancePercent
  );
  const top20 = sorted.slice(0, 20).map((item, idx) => ({
    rank: idx + 1,
    ...buildPrepRow(item),
  }));

  const mainColumns = [
    'statusId',
    'statusUrl',
    'authorHandle',
    'postedAt',
    'text',
    'replies',
    'reposts',
    'likes',
    'bookmarks',
    'views',
    'externalLinks',
    'mediaUrls',
    'relevance %',
    'relevanceReason',
  ];

  const prepColumns = [
    'rank',
    'status_url',
    'author_handle',
    'relevance %',
    'fit_for_agentic_coders',
    'candidate_slug',
    'article_working_title',
    'core_angle',
    'linkedin_hook_draft',
    'evidence_checklist',
  ];

  fs.writeFileSync(output, toCsv(parsed, mainColumns), 'utf8');
  fs.writeFileSync(topOutput, toCsv(top20, prepColumns), 'utf8');

  console.log(`Parsed ${parsed.length} bookmarked posts from HTML.`);
  if (parsed.length < 20) {
    console.log(
      `Only ${parsed.length} posts found in this saved page. Top-20 prep contains ${top20.length} rows.`
    );
    console.log(
      'To get 20+, scroll further in Bookmarks, save again, and rerun this script.'
    );
  }
  console.log(`Wrote: ${output}`);
  console.log(`Wrote: ${topOutput}`);
};

run();
