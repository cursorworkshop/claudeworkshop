#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  copyFileSync,
  mkdirSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_TARGET_ROOT = path.join(os.tmpdir(), 'cursorworkshop-brand-sync');
const DEPLOY_AUTHOR_NAME = 'Claude Workshop';
const DEPLOY_AUTHOR_EMAIL = 'info@claudeworkshop.com';

const SOURCE = {
  productName: 'Claude',
  workshopName: 'Claude Workshop',
  workshopsName: 'Claude Workshops',
  domain: 'claudeworkshop.com',
  siteUrl: 'https://claudeworkshop.com',
  infoEmail: 'info@claudeworkshop.com',
  privacyEmail: 'privacy@claudeworkshop.com',
  calUrl: 'https://cal.com/claudeworkshop',
  calDisplayUrl: 'cal.com/claudeworkshop',
  repoName: 'cursorworkshop',
  repoUrl: 'https://github.com/cursorworkshop/claudeworkshop',
};

const BRANDS = {
  claude: {
    key: 'claude',
    productName: 'Claude',
    workshopName: 'Claude Workshop',
    workshopsName: 'Claude Workshops',
    domain: 'claudeworkshop.com',
    siteUrl: 'https://claudeworkshop.com',
    infoEmail: 'info@claudeworkshop.com',
    privacyEmail: 'privacy@claudeworkshop.com',
    calUrl: 'https://cal.com/claudeworkshop',
    calDisplayUrl: 'cal.com/claudeworkshop',
    repoName: 'claudeworkshop',
    repoUrl: 'https://github.com/cursorworkshop/claudeworkshop.git',
  },
  codex: {
    key: 'codex',
    productName: 'Codex',
    workshopName: 'Codex Workshop',
    workshopsName: 'Codex Workshops',
    domain: 'codexworkshop.com',
    siteUrl: 'https://codexworkshop.com',
    infoEmail: 'info@codexworkshop.com',
    privacyEmail: 'privacy@codexworkshop.com',
    calUrl: 'https://cal.com/codexworkshop',
    calDisplayUrl: 'cal.com/codexworkshop',
    repoName: 'codexworkshop',
    repoUrl: 'https://github.com/cursorworkshop/codexworkshop.git',
  },
};

const MIRROR_EXCLUDES = [
  '.git',
  '.next',
  'node_modules',
  '.vercel',
  '.env.local',
  '.env.vercel',
  '.DS_Store',
  'logo-linkedin.png',
  '.brand-sync',
  '.tmp',
];

const TEXT_EXTENSIONS = new Set([
  '.css',
  '.env',
  '.example',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mdc',
  '.mdx',
  '.mjs',
  '.sql',
  '.svg',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

const TEXT_FILENAMES = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'DEVELOPMENT.md',
  'components.json',
  'package.json',
  'tsconfig.json',
  'vercel.json',
]);

const WORKFLOW_EXCLUDES = [
  '.github/workflows/research-cycle.yml',
  '.github/workflows/research-image-candidates.yml',
  '.github/workflows/sync-brand-sites.yml',
  '.github/workflows/sync-nautilus-research.yml',
  '.github/workflows/sync-nautilus-secrets.yml',
];

function buildSlugPairs(brand) {
  return [
    ['2025-09-16-claude-meetup', `2025-09-16-${brand.key}-meetup`],
    ['2025-10-20-claude-deep-dive', `2025-10-20-${brand.key}-deep-dive`],
    ['claude-2-4-subagents-skills', `${brand.key}-2-4-subagents-skills`],
    [
      'claude-gastown-multi-agent-orchestration',
      `${brand.key}-gastown-multi-agent-orchestration`,
    ],
    [
      'claudeworkshop-enterprise-guide.pdf',
      `${brand.repoName}-enterprise-guide.pdf`,
    ],
  ];
}

function run(command, args, options = {}) {
  const result = execFileSync(command, args, {
    cwd: options.cwd || ROOT_DIR,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
  });

  return typeof result === 'string' ? result.trim() : '';
}

function parseArgs(argv) {
  const parsed = {
    brands: [],
    push: false,
    targetRoot: DEFAULT_TARGET_ROOT,
    githubToken: process.env.BRAND_SYNC_TOKEN || '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--all') {
      parsed.brands = Object.keys(BRANDS);
      continue;
    }

    if (arg === '--brand') {
      parsed.brands.push(String(argv[i + 1] || '').trim());
      i += 1;
      continue;
    }

    if (arg === '--push') {
      parsed.push = true;
      continue;
    }

    if (arg === '--target-root') {
      parsed.targetRoot = path.resolve(String(argv[i + 1] || ''));
      i += 1;
      continue;
    }

    if (arg === '--github-token') {
      parsed.githubToken = String(argv[i + 1] || '').trim();
      i += 1;
    }
  }

  if (parsed.brands.length === 0) {
    parsed.brands = Object.keys(BRANDS);
  }

  parsed.brands = Array.from(new Set(parsed.brands));

  return parsed;
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function isExcludedRelativePath(relativePath) {
  return MIRROR_EXCLUDES.some(
    pattern =>
      relativePath === pattern || relativePath.startsWith(`${pattern}/`)
  );
}

function shouldTreatAsText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_EXTENSIONS.has(ext)) return true;
  return TEXT_FILENAMES.has(path.basename(filePath));
}

function walkFiles(dirPath, rootDir = dirPath) {
  const output = [];

  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.name === '.git') continue;
    if (isExcludedRelativePath(relativePath)) continue;

    if (entry.isDirectory()) {
      output.push(...walkFiles(fullPath, rootDir));
      continue;
    }

    output.push(fullPath);
  }

  return output;
}

function authRepoUrl(repoUrl, githubToken) {
  if (!githubToken) return repoUrl;

  const normalized = repoUrl.replace(/^https:\/\//, '');
  return `https://x-access-token:${githubToken}@${normalized}`;
}

function ensureCleanCheckout(targetDir, brand, githubToken) {
  ensureDir(path.dirname(targetDir));

  if (!existsSync(path.join(targetDir, '.git'))) {
    run('git', ['clone', authRepoUrl(brand.repoUrl, githubToken), targetDir], {
      stdio: 'inherit',
    });
  }

  const status = run('git', ['status', '--porcelain'], { cwd: targetDir });
  if (status) {
    throw new Error(
      `Target repo is dirty: ${targetDir}. Use a clean clone or a different --target-root.`
    );
  }

  run('git', ['checkout', 'main'], { cwd: targetDir, stdio: 'inherit' });
  run('git', ['pull', '--ff-only', 'origin', 'main'], {
    cwd: targetDir,
    stdio: 'inherit',
  });
}

function createTrackedSourceSnapshot() {
  const snapshotDir = mkdtempSync(
    path.join(os.tmpdir(), 'cursorworkshop-brand-sync-source-')
  );
  execFileSync(
    'sh',
    [
      '-c',
      'git archive --format=tar HEAD | tar -xf - -C "$1"',
      'sh',
      snapshotDir,
    ],
    {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    }
  );

  return snapshotDir;
}

function mirrorSourceToTarget(targetDir) {
  const args = ['-a', '--delete'];

  for (const pattern of MIRROR_EXCLUDES) {
    args.push('--exclude', pattern);
  }

  for (const pattern of WORKFLOW_EXCLUDES) {
    args.push('--exclude', pattern);
  }

  const sourceSnapshotDir = createTrackedSourceSnapshot();

  try {
    args.push(`${sourceSnapshotDir}/`, `${targetDir}/`);

    run('rsync', args, { stdio: 'inherit' });
  } finally {
    rmSync(sourceSnapshotDir, { recursive: true, force: true });
  }
}

function removeExcludedWorkflowFiles(targetDir) {
  for (const relativePath of WORKFLOW_EXCLUDES) {
    const fullPath = path.join(targetDir, relativePath);
    if (existsSync(fullPath)) {
      rmSync(fullPath, { force: true });
    }
  }
}

function replaceAll(content, pairs) {
  let next = content;

  for (const [from, to] of pairs) {
    next = next.replaceAll(from, to);
  }

  return next;
}

function applyRegex(content, replacements) {
  let next = content;

  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }

  return next;
}

function transformText(content, brand, relativePath = '') {
  const lowerProduct = brand.productName.toLowerCase();
  const slugPairs = buildSlugPairs(brand);
  const pairs = [
    ['https://www.claudeworkshop.com', `https://www.${brand.domain}`],
    [SOURCE.siteUrl, brand.siteUrl],
    [`www.${SOURCE.domain}`, `www.${brand.domain}`],
    [SOURCE.domain, brand.domain],
    [SOURCE.infoEmail, brand.infoEmail],
    [SOURCE.privacyEmail, brand.privacyEmail],
    [SOURCE.calUrl, brand.calUrl],
    [SOURCE.calDisplayUrl, brand.calDisplayUrl],
    [SOURCE.repoUrl, `https://github.com/cursorworkshop/${brand.repoName}`],
    [`cursorworkshop/${SOURCE.repoName}`, `cursorworkshop/${brand.repoName}`],
    ['claude-workshop-website', `${brand.key}-workshop-website`],
    [SOURCE.workshopsName, brand.workshopsName],
    [SOURCE.workshopName, brand.workshopName],
    ['claude workshops', brand.workshopsName.toLowerCase()],
    ['claude workshop', brand.workshopName.toLowerCase()],
    ['claude ambassadors', `${lowerProduct} ambassadors`],
    ['claude ambassador', `${lowerProduct} ambassador`],
    ['claude training', `${lowerProduct} training`],
    ['claude team', `${lowerProduct} team`],
    ['claude enthusiasts', `${lowerProduct} enthusiasts`],
    ['Claude-first', `${brand.productName}-first`],
    ['Claude training', `${brand.productName} training`],
    ['Claude ambassadors', `${brand.productName} ambassadors`],
    ['Claude ambassador', `${brand.productName} ambassador`],
    ['Claude team', `${brand.productName} team`],
    ['Claude enthusiasts', `${brand.productName} enthusiasts`],
    ['Claude development team', `${brand.productName} development team`],
    ['Claude CLI', `${brand.productName} CLI`],
    ['Claude', brand.productName],
    ...slugPairs,
  ];

  let next = replaceAll(content, pairs);
  next = applyRegex(next, [
    [/\bCursor\b/g, brand.productName],
    [/^cursorworkshop\//gm, `${brand.repoName}/`],
    [/\bcd cursorworkshop\b/g, `cd ${brand.repoName}`],
  ]);
  next = next.replace(
    "const DEFAULT_BRAND_KEY: BrandKey = 'claude';",
    `const DEFAULT_BRAND_KEY: BrandKey = '${brand.key}';`
  );

  if (relativePath === '.cursor/rules/supabase.mdc') {
    next = next.replace(
      `**ONLY use the ${brand.domain} Supabase project for this codebase.**`,
      '**ONLY use the claudeworkshop.com Supabase project for this codebase.**'
    );
  }

  if (relativePath === 'AGENTS.md') {
    next = next.replace(
      `**IMPORTANT**: This project uses a dedicated Supabase project for ${brand.domain}.`,
      '**IMPORTANT**: This repo shares the `cursorworkshop` Supabase project so backend behavior stays aligned across all brand mirrors.'
    );
  }

  return next;
}

function renameIfExists(targetDir, fromRelativePath, toRelativePath) {
  const fromPath = path.join(targetDir, fromRelativePath);
  const toPath = path.join(targetDir, toRelativePath);

  if (!existsSync(fromPath) || fromPath === toPath) {
    return;
  }

  ensureDir(path.dirname(toPath));
  rmSync(toPath, { recursive: true, force: true });
  run('mv', [fromPath, toPath], { cwd: targetDir, stdio: 'inherit' });
}

function renameBrandPaths(targetDir, brand) {
  const slugPairs = buildSlugPairs(brand);

  renameIfExists(
    targetDir,
    'content/events/2025-09-16-claude-meetup',
    `content/events/2025-09-16-${brand.key}-meetup`
  );
  renameIfExists(
    targetDir,
    'content/events/2025-10-20-claude-deep-dive',
    `content/events/2025-10-20-${brand.key}-deep-dive`
  );
  renameIfExists(
    targetDir,
    'content/workshops/2025-10-20-claude-deep-dive',
    `content/workshops/2025-10-20-${brand.key}-deep-dive`
  );
  renameIfExists(
    targetDir,
    'content/sponsors/cursor.md',
    `content/sponsors/${brand.key}.md`
  );
  renameIfExists(
    targetDir,
    'content/editorials/claude-2-4-subagents-skills.mdx',
    `content/editorials/${brand.key}-2-4-subagents-skills.mdx`
  );
  renameIfExists(
    targetDir,
    'content/editorials/claude-gastown-multi-agent-orchestration.mdx',
    `content/editorials/${brand.key}-gastown-multi-agent-orchestration.mdx`
  );

  for (const [fromValue, toValue] of slugPairs) {
    renameIfExists(
      targetDir,
      `public/images/events/${fromValue}`,
      `public/images/events/${toValue}`
    );
  }
}

function transformTextFiles(targetDir, brand) {
  const changedFiles = [];

  for (const filePath of walkFiles(targetDir)) {
    if (!shouldTreatAsText(filePath)) continue;

    const relativePath = path.relative(targetDir, filePath);
    const original = readFileSync(filePath, 'utf8');
    const next = transformText(original, brand, relativePath);

    if (next !== original) {
      writeFileSync(filePath, next);
      changedFiles.push(filePath);
    }
  }

  return changedFiles;
}

function chunk(items, size) {
  const output = [];

  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }

  return output;
}

function shouldFormatWithPrettier(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (
    relativePath.endsWith('package.json') ||
    relativePath.endsWith('AGENTS.md') ||
    relativePath.endsWith('README.md') ||
    relativePath.endsWith('CLAUDE.md')
  ) {
    return true;
  }

  const supportedExtensions = new Set([
    '.css',
    '.html',
    '.js',
    '.json',
    '.jsx',
    '.md',
    '.mdx',
    '.mjs',
    '.svg',
    '.ts',
    '.tsx',
    '.yaml',
    '.yml',
  ]);

  if (!supportedExtensions.has(ext)) {
    return false;
  }

  return (
    relativePath.includes('/src/') ||
    relativePath.includes('/scripts/') ||
    relativePath.includes('/.github/')
  );
}

function formatChangedFiles(filePaths) {
  const supportedFiles = filePaths.filter(shouldFormatWithPrettier);

  if (supportedFiles.length === 0) {
    return;
  }

  for (const group of chunk(supportedFiles, 100)) {
    run('pnpm', ['exec', 'prettier', '--write', ...group], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
  }
}

function syncBrandAssets(targetDir, brand) {
  const brandAsset = path.join(
    targetDir,
    'public',
    'images',
    'brands',
    `${brand.key}-logo.png`
  );

  if (!existsSync(brandAsset)) {
    throw new Error(`Missing brand asset in mirror: ${brandAsset}`);
  }

  const rootBrandImage = path.join(targetDir, `${brand.key}-2.png`);
  copyFileSync(brandAsset, rootBrandImage);

  const linkedinImage = path.join(
    targetDir,
    'public',
    'images',
    `${brand.repoName}-linkedin-pic.png`
  );
  copyFileSync(brandAsset, linkedinImage);

  const staleAssets = [
    path.join(targetDir, 'cursor-2.png'),
    path.join(targetDir, 'public', 'images', 'cursorworkshop-linkedin-pic.png'),
  ];

  for (const assetPath of staleAssets) {
    if (existsSync(assetPath)) {
      rmSync(assetPath, { force: true });
    }
  }
}

function stageCommitAndMaybePush(targetDir, brand, push) {
  run('git', ['add', '-A'], { cwd: targetDir, stdio: 'inherit' });
  const status = run('git', ['status', '--short'], { cwd: targetDir });

  if (!status) {
    console.log(`[${brand.repoName}] already up to date`);
    return;
  }

  const sourceSha = run('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: ROOT_DIR,
  });
  const commitMessage = `sync: mirror cursorworkshop@${sourceSha}`;

  run(
    'git',
    [
      '-c',
      `user.name=${DEPLOY_AUTHOR_NAME}`,
      '-c',
      `user.email=${DEPLOY_AUTHOR_EMAIL}`,
      'commit',
      '-m',
      commitMessage,
    ],
    {
      cwd: targetDir,
      stdio: 'inherit',
    }
  );

  if (push) {
    run('git', ['pull', '--rebase', 'origin', 'main'], {
      cwd: targetDir,
      stdio: 'inherit',
    });
    run('git', ['push', 'origin', 'main'], {
      cwd: targetDir,
      stdio: 'inherit',
    });
  }
}

function validateBrandDirs(targetDir) {
  const required = [
    path.join(targetDir, 'src', 'lib', 'brand.ts'),
    path.join(targetDir, 'src', 'components', 'BrandLogo.tsx'),
    path.join(targetDir, 'public', 'images', 'brands'),
  ];

  for (const item of required) {
    if (!existsSync(item)) {
      throw new Error(`Mirror validation failed, missing ${item}`);
    }
  }
}

function syncBrandRepo(brand, options) {
  const targetDir = path.join(options.targetRoot, brand.repoName);
  console.log(`\n==> Syncing ${brand.repoName} into ${targetDir}`);

  ensureCleanCheckout(targetDir, brand, options.githubToken);
  mirrorSourceToTarget(targetDir);
  removeExcludedWorkflowFiles(targetDir);
  renameBrandPaths(targetDir, brand);
  const changedFiles = transformTextFiles(targetDir, brand);
  formatChangedFiles(changedFiles);
  syncBrandAssets(targetDir, brand);
  validateBrandDirs(targetDir);
  stageCommitAndMaybePush(targetDir, brand, options.push);
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  for (const brandKey of options.brands) {
    const brand = BRANDS[brandKey];
    if (!brand) {
      throw new Error(`Unknown brand "${brandKey}". Use claude or codex.`);
    }

    syncBrandRepo(brand, options);
  }

  console.log(`\nFinished brand sync into ${options.targetRoot}`);
}

main();
