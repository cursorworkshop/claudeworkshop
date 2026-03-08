#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

const hasFlag = name => argv.includes(name);
const getArgValue = (name, fallback) => {
  const idx = argv.findIndex(arg => arg === name);
  if (idx === -1) return fallback;
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const nodeBin = process.execPath;
const dryRun = hasFlag('--dry-run');
const maxPages = getArgValue('--max-pages', process.env.NAUTILUS_MAX_PAGES || '100');
const topN = getArgValue('--top', process.env.NAUTILUS_TOP_N || '20');
const minRelevance = getArgValue('--min-relevance', process.env.NAUTILUS_MIN_RELEVANCE || '25');
const maxDraftAttempts = getArgValue('--max-draft-attempts', process.env.NAUTILUS_MAX_DRAFT_ATTEMPTS || '3');
const minWordCount = getArgValue(
  '--min-word-count',
  process.env.NAUTILUS_MIN_WORD_COUNT || '450'
);
const maxWordCount = getArgValue(
  '--max-word-count',
  process.env.NAUTILUS_MAX_WORD_COUNT || '1100'
);
const targetWordCount = getArgValue(
  '--target-word-count',
  process.env.NAUTILUS_TARGET_WORD_COUNT || '900'
);
const cursorRepo = getArgValue('--cursor-repo', process.env.CURSORWORKSHOP_REPO_PATH || '');
const applyToCursor = hasFlag('--apply-to-cursor');
const allowStaleBookmarksFallback =
  !hasFlag('--no-stale-bookmarks-fallback') &&
  (process.env.NAUTILUS_ALLOW_STALE_BOOKMARKS_FALLBACK || '1') !== '0';
const pipelineStartedAt =
  process.env.NAUTILUS_PIPELINE_STARTED_AT || new Date().toISOString();

const scoredBookmarksPath = path.join(
  PROJECT_ROOT,
  'data',
  'live',
  'X-bookmarks.live.scored.json'
);
const lastKnownGoodScoredBookmarksPath = path.join(
  PROJECT_ROOT,
  'data',
  'state',
  'X-bookmarks.last-known-good.scored.json'
);

const run = (scriptName, extraArgs = []) => {
  const scriptPath = path.join(PROJECT_ROOT, 'pipeline', scriptName);
  console.log(`\n==> ${scriptName} ${extraArgs.join(' ')}`.trim());
  execFileSync(nodeBin, [scriptPath, ...extraArgs], {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      NAUTILUS_PIPELINE_STARTED_AT: pipelineStartedAt,
    },
  });
};

const hasUsableScoredBookmarks = () => {
  const preferredPath = fs.existsSync(scoredBookmarksPath)
    ? scoredBookmarksPath
    : lastKnownGoodScoredBookmarksPath;
  if (!fs.existsSync(preferredPath)) return false;
  try {
    const parsed = JSON.parse(fs.readFileSync(preferredPath, 'utf8'));
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
};

const resolveScoredBookmarksInputPath = () => {
  if (fs.existsSync(scoredBookmarksPath)) return scoredBookmarksPath;
  if (fs.existsSync(lastKnownGoodScoredBookmarksPath)) {
    return lastKnownGoodScoredBookmarksPath;
  }
  return scoredBookmarksPath;
};

let scoredBookmarksInputPath = scoredBookmarksPath;

console.log(`Pipeline started at: ${pipelineStartedAt}`);

try {
  run('fetch-bookmarks-to-csv.mjs', ['--max-pages', maxPages, '--top', topN]);
} catch (error) {
  if (!allowStaleBookmarksFallback || !hasUsableScoredBookmarks()) {
    throw error;
  }

  scoredBookmarksInputPath = resolveScoredBookmarksInputPath();
  console.warn('\n⚠️ Fresh bookmark fetch failed; continuing with latest usable snapshot.');
  console.warn(`⚠️ Snapshot: ${scoredBookmarksInputPath}`);
}
const selectionArgs = [
  '--min-relevance',
  minRelevance,
  '--input-json',
  scoredBookmarksInputPath,
];

if (cursorRepo) {
  selectionArgs.push('--cursor-repo', cursorRepo);
}

run('select-next-research-candidate.mjs', selectionArgs);

const candidatePath = path.join(
  PROJECT_ROOT,
  'data',
  'state',
  'X-bookmarks.next-research-candidate.json'
);
let candidate = null;
if (fs.existsSync(candidatePath)) {
  candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
}

if (!candidate || candidate.status !== 'ok') {
  console.log('\nNo candidate passed selection. Skipping build/apply stage.');
  console.log('\nCycle completed successfully.');
  process.exit(0);
}

const buildArgs = [
  '--min-relevance',
  minRelevance,
  '--max-draft-attempts',
  maxDraftAttempts,
  '--min-word-count',
  minWordCount,
  '--max-word-count',
  maxWordCount,
  '--target-word-count',
  targetWordCount,
];
if (cursorRepo) {
  buildArgs.push('--cursor-repo', cursorRepo);
}
if (dryRun) buildArgs.push('--dry-run');
run('build-and-package-research.mjs', buildArgs);

if (dryRun) {
  console.log('\nSkipping candidate selection mark (--dry-run).');
} else {
  run('mark-candidate-selected.mjs');
}

if (applyToCursor) {
  if (!cursorRepo) {
    throw new Error('--apply-to-cursor requires --cursor-repo or CURSORWORKSHOP_REPO_PATH');
  }
  const applyArgs = ['--cursor-repo', cursorRepo];
  if (dryRun) applyArgs.push('--dry-run');
  run('apply-package-to-cursorworkshop.mjs', applyArgs);
}

console.log('\nCycle completed successfully.');
