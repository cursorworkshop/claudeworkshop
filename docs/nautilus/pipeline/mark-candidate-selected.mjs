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

const candidateJsonPath = path.resolve(
  getArgValue(
    '--candidate-json',
    path.join(PROJECT_ROOT, 'data', 'state', 'X-bookmarks.next-research-candidate.json')
  )
);
const stateJsonPath = path.resolve(
  getArgValue('--state-json', path.join(PROJECT_ROOT, 'data', 'state', 'X-bookmarks.selection-state.json'))
);

const readJson = filePath => {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const candidate = readJson(candidateJsonPath);
if (!candidate || candidate.status !== 'ok' || !candidate.id) {
  console.log('No selected candidate to mark.');
  process.exit(0);
}

const state = readJson(stateJsonPath) || { selected_ids: [], history: [] };
const selectedIds = new Set(Array.isArray(state.selected_ids) ? state.selected_ids : []);

if (selectedIds.has(candidate.id)) {
  console.log(`Candidate ${candidate.id} already marked selected.`);
  process.exit(0);
}

selectedIds.add(candidate.id);
const next = {
  ...state,
  selected_ids: [...selectedIds],
  history: [
    ...(Array.isArray(state.history) ? state.history : []),
    {
      id: candidate.id,
      selected_at: new Date().toISOString(),
      relevance_percent: candidate.relevance_percent ?? null,
      candidate_slug: candidate.candidate_slug ?? null,
    },
  ],
};

writeJson(stateJsonPath, next);
console.log(`Marked selected candidate: ${candidate.id}`);
console.log(`State updated: ${stateJsonPath}`);
