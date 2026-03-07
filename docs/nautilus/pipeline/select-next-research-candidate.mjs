#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);

const getArgValue = (name, fallback) => {
  const idx = argv.findIndex(arg => arg === name);
  if (idx === -1) return fallback;
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const hasFlag = name => argv.includes(name);

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const RESEARCH_DIR = path.resolve(SCRIPT_DIR, '..');
const dataDir = path.resolve(
  getArgValue('--out-dir', path.join(RESEARCH_DIR, 'data'))
);
const inputJson = path.resolve(
  getArgValue(
    '--input-json',
    path.join(dataDir, 'live', 'X-bookmarks.live.scored.json')
  )
);
const outputJson = path.resolve(
  getArgValue(
    '--output-json',
    path.join(dataDir, 'state', 'X-bookmarks.next-research-candidate.json')
  )
);
const stateJson = path.resolve(
  getArgValue(
    '--state-json',
    path.join(dataDir, 'state', 'X-bookmarks.selection-state.json')
  )
);
const minRelevance = Math.max(
  0,
  Math.min(100, Number.parseInt(getArgValue('--min-relevance', '65'), 10) || 65)
);
const allowReuseSelected =
  !hasFlag('--no-reuse-selected') &&
  (hasFlag('--allow-reuse-selected') ||
    (process.env.NAUTILUS_ALLOW_REUSE_SELECTED || '0') === '1');
const markSelected = hasFlag('--mark-selected');

const safeDate = input => {
  const ms = Date.parse(input || '');
  return Number.isFinite(ms) ? ms : 0;
};

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

const readJson = filePath => {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const rows = readJson(inputJson);
if (!Array.isArray(rows)) {
  throw new Error(`Expected array in ${inputJson}`);
}

const state = readJson(stateJson) || {
  selected_ids: [],
  published_ids: [],
  history: [],
};
const selectedIds = new Set(
  Array.isArray(state.selected_ids) ? state.selected_ids : []
);
const publishedIds = new Set(
  Array.isArray(state.published_ids) ? state.published_ids : []
);
for (const entry of Array.isArray(state.history) ? state.history : []) {
  if (entry?.id && entry?.published_at) {
    publishedIds.add(entry.id);
  }
}

const ranked = [...rows]
  .filter(row => Number(row['relevance %']) >= minRelevance)
  .sort(
    (a, b) =>
      Number(b['relevance %']) - Number(a['relevance %']) ||
      safeDate(b.created_at) - safeDate(a.created_at)
  );

const unpublishedRanked = ranked.filter(row => !publishedIds.has(row.id));

let pick = unpublishedRanked.find(row => !selectedIds.has(row.id));
let reusedSelectedCandidate = false;

if (!pick && allowReuseSelected && unpublishedRanked.length > 0) {
  pick = unpublishedRanked[0];
  reusedSelectedCandidate = true;
}

if (!pick) {
  const noPick = {
    generated_at: new Date().toISOString(),
    min_relevance: minRelevance,
    status: 'no_candidate',
    message:
      'No unpublished candidate found above threshold. Add fresh bookmarks or explicitly allow selected-candidate reuse.',
  };
  writeJson(outputJson, noPick);
  console.log('No candidate found.');
  console.log(`Output: ${outputJson}`);
  process.exit(0);
}

const topic = classifyTopic(pick.text);
const core = firstSentence(pick.text);
const candidate = {
  generated_at: new Date().toISOString(),
  min_relevance: minRelevance,
  status: 'ok',
  id: pick.id,
  status_url: pick.status_url,
  author_handle: pick.author_handle,
  author_name: pick.author_name,
  created_at: pick.created_at,
  relevance_percent: Number(pick['relevance %']),
  relevance_reason: pick.relevance_reason,
  topic,
  candidate_slug: slugify(`${topic}-${pick.id}`).slice(0, 72),
  article_working_title: `What ${topic} changes for teams shipping with coding agents`,
  core_angle:
    core || 'Translate this signal into practical team workflow changes.',
  image_prompt_draft:
    'Single developer seated at one desk in three-quarter back profile, focused on one monitor with subtle abstract cues of agent orchestration. No extra people.',
  humanizer_notes:
    'Use short, specific sentences. Avoid inflated claims and generic AI vocabulary.',
  reused_selected_candidate: reusedSelectedCandidate,
};

writeJson(outputJson, candidate);

if (markSelected) {
  const nextState = {
    ...state,
    selected_ids: [...new Set([...selectedIds, candidate.id])],
    published_ids: [...publishedIds],
    history: [
      ...(Array.isArray(state.history) ? state.history : []),
      {
        id: candidate.id,
        selected_at: candidate.generated_at,
        relevance_percent: candidate.relevance_percent,
      },
    ],
  };
  writeJson(stateJson, nextState);
}

if (reusedSelectedCandidate) {
  console.log(
    `Selected previously-used candidate due exhausted pool: ${candidate.id} (${candidate.relevance_percent}%)`
  );
} else {
  console.log(
    `Selected candidate: ${candidate.id} (${candidate.relevance_percent}%)`
  );
}
console.log(`Output: ${outputJson}`);
if (markSelected) {
  console.log(`State updated: ${stateJson}`);
}
