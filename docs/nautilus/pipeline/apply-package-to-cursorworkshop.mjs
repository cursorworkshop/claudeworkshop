#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

const getArgValue = (name, fallback = '') => {
  const idx = argv.findIndex(arg => arg === name);
  if (idx === -1) return fallback;
  const next = argv[idx + 1];
  if (!next || next.startsWith('--')) return fallback;
  return next;
};

const hasFlag = name => argv.includes(name);

const latestOutbox = () => {
  const root = path.join(PROJECT_ROOT, 'data', 'outbox');
  if (!fs.existsSync(root)) return '';
  const dirs = fs
    .readdirSync(root)
    .map(name => path.join(root, name))
    .filter(full => fs.statSync(full).isDirectory())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return dirs[0] || '';
};

const packageDir = path.resolve(getArgValue('--package-dir', latestOutbox()));
const cursorRepo = path.resolve(
  getArgValue('--cursor-repo', process.env.CURSORWORKSHOP_REPO_PATH || '')
);
const researchContentRel = getArgValue('--content-dir', 'content/editorials');
const imageDirRel = getArgValue('--image-dir', 'public/images/editorials');
const imageMapRel = getArgValue(
  '--research-list-file',
  'src/components/ResearchList.tsx'
);
const overwrite = hasFlag('--overwrite');
const skipImageMap = hasFlag('--skip-image-map');
const dryRun = hasFlag('--dry-run');

if (!packageDir || !fs.existsSync(packageDir)) {
  throw new Error(
    'Package directory not found. Use --package-dir or ensure outbox has a run.'
  );
}
if (!cursorRepo || !fs.existsSync(cursorRepo)) {
  throw new Error(
    'CursorWorkshop repo path not found. Set --cursor-repo or CURSORWORKSHOP_REPO_PATH.'
  );
}

const manifestPath = path.join(packageDir, 'package.json');
const articlePath = path.join(packageDir, 'article.mdx');
const imagePath = path.join(packageDir, 'image.png');

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Missing package manifest: ${manifestPath}`);
}
if (!fs.existsSync(articlePath)) {
  throw new Error(`Missing article.mdx: ${articlePath}`);
}
if (!fs.existsSync(imagePath)) {
  throw new Error(
    `Missing image.png: ${imagePath}. Refusing to publish article without a generated hero image.`
  );
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const slug = manifest.slug;
if (!slug) {
  throw new Error('Manifest missing slug.');
}

const contentDir = path.join(cursorRepo, researchContentRel);
const imageDir = path.join(cursorRepo, imageDirRel);
const imageMapPath = path.join(cursorRepo, imageMapRel);

const targetArticlePath = path.join(contentDir, `${slug}.mdx`);
const targetImagePath = path.join(imageDir, `${slug}.png`);

if (!overwrite && fs.existsSync(targetArticlePath)) {
  throw new Error(
    `Article already exists: ${targetArticlePath}. Use --overwrite if intended.`
  );
}
if (!overwrite && fs.existsSync(targetImagePath) && fs.existsSync(imagePath)) {
  throw new Error(
    `Image already exists: ${targetImagePath}. Use --overwrite if intended.`
  );
}

const updateResearchImageMap = (filePath, articleSlug, webPath) => {
  if (!fs.existsSync(filePath)) return false;
  const source = fs.readFileSync(filePath, 'utf8');
  if (
    source.includes(`'${articleSlug}':`) ||
    source.includes(`\"${articleSlug}\":`)
  ) {
    return false;
  }

  const marker = 'const articleImages: Record<string, string> = {';
  const start = source.indexOf(marker);
  if (start === -1) return false;

  const end = source.indexOf('\n};', start);
  if (end === -1) return false;

  const insert = `  '${articleSlug}': '${webPath}',\n`;
  const updated = `${source.slice(0, end)}\n${insert}${source.slice(end)}`;

  if (!dryRun) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
  return true;
};

const changed = [];

if (!dryRun) {
  fs.mkdirSync(contentDir, { recursive: true });
  fs.copyFileSync(articlePath, targetArticlePath);
}
changed.push(path.relative(cursorRepo, targetArticlePath));

if (!dryRun) {
  fs.mkdirSync(imageDir, { recursive: true });
  fs.copyFileSync(imagePath, targetImagePath);
}
changed.push(path.relative(cursorRepo, targetImagePath));

if (!skipImageMap) {
  const updated = updateResearchImageMap(
    imageMapPath,
    slug,
    `/images/editorials/${slug}.png`
  );
  if (updated) {
    changed.push(path.relative(cursorRepo, imageMapPath));
  }
}

const statePath = path.join(PROJECT_ROOT, 'data', 'state', 'latest-apply.json');
const state = {
  applied_at: new Date().toISOString(),
  dry_run: dryRun,
  slug,
  package_dir: path.relative(PROJECT_ROOT, packageDir),
  cursor_repo: cursorRepo,
  changed_files: changed,
};

if (!dryRun) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

console.log(`Applied package: ${packageDir}`);
console.log(`Target repo: ${cursorRepo}`);
console.log('Changed files:');
for (const file of changed) {
  console.log(`- ${file}`);
}
if (dryRun) {
  console.log('Dry run: no files written.');
}
