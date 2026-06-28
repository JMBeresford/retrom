#!/usr/bin/env bash
set -euo pipefail

AGENTS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$AGENTS_DIR/.." && pwd)"
SRC="$REPO_ROOT/.agents/mcp/servers.json"

if [ ! -f "$SRC" ]; then
  echo "No $SRC found; nothing to sync." 
  exit 0
fi

CLAUDE_OUT="$REPO_ROOT/.mcp.json"
CURSOR_OUT="$REPO_ROOT/.cursor/mcp.json"
CODEX_OUT="$REPO_ROOT/.codex/config.toml"

mkdir -p "$(dirname "$CURSOR_OUT")" "$(dirname "$CODEX_OUT")"

mode="${1:-}"

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

python3 - "$SRC" "$tmpdir/claude.json" "$tmpdir/cursor.json" "$tmpdir/codex.toml" <<'PY'
import json, sys
src, claude_out, cursor_out, codex_out = sys.argv[1:5]
with open(src) as f:
    data = json.load(f)
with open(claude_out, "w") as f:
    json.dump(data, f, indent=2, sort_keys=True)
with open(cursor_out, "w") as f:
    json.dump(data, f, indent=2, sort_keys=True)
lines = ["# Generated from .agents/mcp/servers.json"]
for name, cfg in data.items():
    lines.append(f'[mcp_servers.{name}]')
    for k, v in cfg.items():
        import json as _json
        lines.append(f'{k} = {_json.dumps(v)}')
    lines.append("")
with open(codex_out, "w") as f:
    f.write("\n".join(lines))
PY

if [ "$mode" = "check" ]; then
  rc=0
  # Map tmp files to destinations
  for srcfile in "$tmpdir/claude.json" "$tmpdir/cursor.json" "$tmpdir/codex.toml"; do
    case "$srcfile" in
      */claude.json) dest="$CLAUDE_OUT" ;;
      */cursor.json) dest="$CURSOR_OUT" ;;
      */codex.toml) dest="$CODEX_OUT" ;;
    esac
    if [ ! -f "$dest" ]; then
      echo "Missing generated file: $dest"
      rc=1
      continue
    fi
    if ! cmp -s "$dest" "$srcfile"; then
      echo "Out-of-date: $dest"
      rc=1
    fi
  done
  exit $rc
else
  mv "$tmpdir/claude.json" "$CLAUDE_OUT"
  mv "$tmpdir/cursor.json" "$CURSOR_OUT"
  mv "$tmpdir/codex.toml" "$CODEX_OUT"
  echo "Wrote: $CLAUDE_OUT, $CURSOR_OUT, $CODEX_OUT"
fi
