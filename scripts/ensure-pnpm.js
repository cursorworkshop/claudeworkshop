const userAgent = process.env.npm_config_user_agent || '';
const fs = require('node:fs');
const path = require('node:path');

const rootDir = process.cwd();
const packageLockPath = path.join(rootDir, 'package-lock.json');

if (!userAgent.includes('pnpm')) {
  // Keep message short and actionable.
  console.error(
    '\nThis repository uses pnpm.\n\nRun:\n  corepack enable\n  pnpm install\n'
  );
  process.exit(1);
}

if (fs.existsSync(packageLockPath)) {
  console.error(
    '\nDetected package-lock.json.\n\nThis repository is pnpm-only.\nRemove package-lock.json and run:\n  pnpm install\n'
  );
  process.exit(1);
}
