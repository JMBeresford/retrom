#!/usr/bin/env bash
set -euo pipefail

# Simple generator: render .github/agents/mcp.json from .agents/mcp/servers.json
# Supports `check` mode: exit 0 if up-to-date, non-zero if stale.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/.agents/mcp/servers.json"
OUT_DIR="$REPO_ROOT/.github/agents"
OUT_FILE="$OUT_DIR/mcp.json"

mkdir -p "$OUT_DIR"

jq . "$SRC" > "$OUT_FILE".tmp

if [ "${1-}" = "check" ]; then
  if [ -f "$OUT_FILE" ] && cmp -s "$OUT_FILE" "$OUT_FILE".tmp; then
    rm "$OUT_FILE".tmp
    echo "mcp.json is up-to-date"
    exit 0
  else
    echo "mcp.json is stale or missing"
    exit 2
  fi
else
  mv "$OUT_FILE".tmp "$OUT_FILE"
  echo "Wrote $OUT_FILE"
fi
