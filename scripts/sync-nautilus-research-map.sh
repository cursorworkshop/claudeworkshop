#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT_DIR/docs/nautilus"
TARGET_REPO="${1:-${NAUTILUS_REPO_PATH:-}}"

if [ -z "$TARGET_REPO" ]; then
  echo "Usage: scripts/sync-nautilus-research-map.sh /absolute/path/to/nautilus"
  echo "Or set NAUTILUS_REPO_PATH."
  exit 1
fi

if [ ! -d "$SRC_DIR" ]; then
  echo "Source research map not found: $SRC_DIR"
  exit 1
fi

if [ ! -d "$TARGET_REPO/.git" ]; then
  echo "Target is not a git repo: $TARGET_REPO"
  exit 1
fi

sync_dir() {
  local from="$1"
  local to="$2"
  mkdir -p "$to"
  rsync -a --exclude '.DS_Store' "$from/" "$to/"
}

sync_dir_mirror() {
  local from="$1"
  local to="$2"
  mkdir -p "$to"
  rsync -a --delete --exclude '.DS_Store' "$from/" "$to/"
}

sync_file() {
  local from="$1"
  local to="$2"
  mkdir -p "$(dirname "$to")"
  cp "$from" "$to"
}

echo "Syncing research map from $SRC_DIR -> $TARGET_REPO"

# Mirror only research-map-owned assets (no runtime data snapshots).
sync_dir_mirror "$SRC_DIR/pipeline" "$TARGET_REPO/pipeline"
sync_dir_mirror "$SRC_DIR/prompts" "$TARGET_REPO/prompts"
sync_dir_mirror "$SRC_DIR/scripts" "$TARGET_REPO/scripts"
sync_dir "$SRC_DIR/docs" "$TARGET_REPO/docs"
sync_dir_mirror "$SRC_DIR/diagrams" "$TARGET_REPO/docs/diagrams"
sync_dir_mirror "$SRC_DIR/examples" "$TARGET_REPO/docs/examples"
sync_file "$ROOT_DIR/.github/workflows/research-image-candidates.yml" \
  "$TARGET_REPO/.github/workflows/research-image-candidates.yml"

BUILD_FILE="$TARGET_REPO/pipeline/build-and-package-research.mjs"
CANDIDATE_FILE="$TARGET_REPO/pipeline/generate-image-candidates.mjs"
STYLE_TEMPLATE_FILE="$TARGET_REPO/docs/examples/image-style/style-template.json"
STYLE_README_FILE="$TARGET_REPO/docs/examples/image-style/README.md"
CANDIDATE_WORKFLOW_FILE="$TARGET_REPO/.github/workflows/research-image-candidates.yml"
STYLE_REFERENCE_SCRIPT="$TARGET_REPO/scripts/set-image-style-reference.sh"

# Adapt cursorworkshop mirror paths to Nautilus root layout.
perl -0pi -e "s#path\\.join\\(PROJECT_ROOT, 'examples', 'image-style', 'style-template\\.json'\\)#path.join(PROJECT_ROOT, 'docs', 'examples', 'image-style', 'style-template.json')#g; s#path\\.join\\(\\n\\s*PROJECT_ROOT,\\n\\s*'examples',\\n\\s*'image-style',\\n\\s*'target-style-reference\\.png'\\n\\)#path.join(\\n  PROJECT_ROOT,\\n  'docs',\\n  'examples',\\n  'image-style',\\n  'target-style-reference.png'\\n)#g; s#path\\.join\\(\\n\\s*PROJECT_ROOT,\\n\\s*'examples',\\n\\s*'image-style',\\n\\s*'reference-style-spec\\.md'\\n\\)#path.join(\\n  PROJECT_ROOT,\\n  'docs',\\n  'examples',\\n  'image-style',\\n  'reference-style-spec.md'\\n)#g" \
  "$BUILD_FILE"

perl -0pi -e "s#const PROJECT_ROOT = path\\.resolve\\(SCRIPT_DIR, '\\.\\.', '\\.\\.', '\\.\\.'\\);#const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');#g; s#path\\.join\\(PROJECT_ROOT, 'docs', 'nautilus', 'examples', 'image-style', 'style-template\\.json'\\)#path.join(PROJECT_ROOT, 'docs', 'examples', 'image-style', 'style-template.json')#g; s#path\\.join\\(PROJECT_ROOT, 'docs', 'nautilus', 'data', 'image-candidates'\\)#path.join(PROJECT_ROOT, 'data', 'image-candidates')#g; s#path\\.join\\('docs', 'nautilus', 'examples', 'image-style', 'target-style-reference\\.png'\\)#path.join('docs', 'examples', 'image-style', 'target-style-reference.png')#g" \
  "$CANDIDATE_FILE"

perl -0pi -e "s#const defaultArticles = \\[\\n  'content/editorials/mcp-and-integrations-1961848171925278932\\.mdx',\\n  'content/editorials/multi-agent-orchestration-2019564738649505882\\.mdx',\\n  'content/editorials/ai-coding-tooling-1977706278110765481\\.mdx',\\n\\];\\nconst articlePaths = String\\(getArgValue\\('--articles', defaultArticles\\.join\\(','\\)\\)\\)\\n  \\.split\\(','\\)\\n  \\.map\\(value => value\\.trim\\(\\)\\)\\n  \\.filter\\(Boolean\\)\\n  \\.map\\(value => path\\.resolve\\(PROJECT_ROOT, value\\)\\);#const discoverDefaultArticles = () => {\\n  const outboxDir = path.join(PROJECT_ROOT, 'data', 'outbox');\\n  if (!fs.existsSync(outboxDir)) return [];\\n\\n  return fs\\n    .readdirSync(outboxDir, { withFileTypes: true })\\n    .filter(entry => entry.isDirectory())\\n    .map(entry => {\\n      const articleFile = path.join(outboxDir, entry.name, 'article.mdx');\\n      const contentFile = path.join(outboxDir, entry.name, 'content.mdx');\\n      const filePath = fs.existsSync(articleFile)\\n        ? articleFile\\n        : fs.existsSync(contentFile)\\n          ? contentFile\\n          : null;\\n      if (!filePath) return null;\\n      if (!fs.existsSync(filePath)) return null;\\n      const stat = fs.statSync(filePath);\\n      return { filePath, mtimeMs: stat.mtimeMs };\\n    })\\n    .filter(Boolean)\\n    .sort((a, b) => b.mtimeMs - a.mtimeMs)\\n    .slice(0, 3)\\n    .map(item => item.filePath);\\n};\\n\\nconst articlesArg = String(getArgValue('--articles', '')).trim();\\nconst articlePaths = (articlesArg\\n  ? articlesArg\\n      .split(',')\\n      .map(value => value.trim())\\n      .filter(Boolean)\\n      .map(value => path.resolve(PROJECT_ROOT, value))\\n  : discoverDefaultArticles());#s" \
  "$CANDIDATE_FILE"

perl -0pi -e "s#if \\(!openAiKey\\) \\{\\n  throw new Error\\('OPENAI_API_KEY is required\\.'\\);\\n\\}#if (!openAiKey) {\\n  throw new Error('OPENAI_API_KEY is required.');\\n}\\nif (!articlePaths.length) {\\n  throw new Error(\\n    'No article paths found. Pass --articles or ensure data/outbox/*/(article.mdx|content.mdx) exists.'\\n  );\\n}#g; s#const articleSlug = slugify\\(path\\.basename\\(articlePath, '\\.mdx'\\)\\);#const articleBase = path.basename(articlePath, '.mdx');\\n  const articleSlug = slugify(\\n    articleBase === 'content' || articleBase === 'article'\\n      ? path.basename(path.dirname(articlePath))\\n      : articleBase\\n  );#g" \
  "$CANDIDATE_FILE"

perl -0pi -e "s#\"path\": \"docs/nautilus/examples/image-style/target-style-reference\\.png\"#\"path\": \"docs/examples/image-style/target-style-reference.png\"#g" \
  "$STYLE_TEMPLATE_FILE"

perl -0pi -e "s#docs/nautilus/scripts/set-image-style-reference\\.sh#scripts/set-image-style-reference.sh#g" \
  "$STYLE_README_FILE"

perl -0pi -e "s#Usage: docs/nautilus/scripts/set-image-style-reference\\.sh#Usage: scripts/set-image-style-reference.sh#g; s#/examples/image-style#/docs/examples/image-style#g" \
  "$STYLE_REFERENCE_SCRIPT"

perl -0pi -e "s#default: 'content/editorials/mcp-and-integrations-1961848171925278932\\.mdx,content/editorials/multi-agent-orchestration-2019564738649505882\\.mdx,content/editorials/ai-coding-tooling-1977706278110765481\\.mdx'#default: ''#g; s#description: 'Comma-separated article paths'#description: 'Comma-separated article paths (optional; defaults to latest data/outbox/*/(article.mdx|content.mdx))'#g; s#node docs/nautilus/pipeline/generate-image-candidates\\.mjs#node pipeline/generate-image-candidates.mjs#g; s#docs/nautilus/data/image-candidates#data/image-candidates#g" \
  "$CANDIDATE_WORKFLOW_FILE"

echo "Research map sync complete."
