#!/bin/bash
# Project-specific Gemini CLI wrapper
# Sets GEMINI_API_KEY only for this project

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load API key from .env.local if it exists
if [ -f "$SCRIPT_DIR/.env.local" ]; then
  # Source the file and export the variable
  set -a
  source "$SCRIPT_DIR/.env.local"
  set +a
fi

# Run Gemini CLI with the API key
exec gemini "$@"
