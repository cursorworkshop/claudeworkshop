#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: docs/nautilus/scripts/set-image-style-reference.sh /absolute/path/to/reference.png"
  exit 1
fi

SRC="$1"
TARGET_DIR="$(cd "$(dirname "$0")/.." && pwd)/examples/image-style"
TARGET="$TARGET_DIR/target-style-reference.png"

if [ ! -f "$SRC" ]; then
  echo "Source file not found: $SRC"
  exit 1
fi

mkdir -p "$TARGET_DIR"
cp "$SRC" "$TARGET"

echo "Saved style reference: $TARGET"
