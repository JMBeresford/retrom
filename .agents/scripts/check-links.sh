#!/usr/bin/env bash
set -euo pipefail

# Check that skills in .agents/skills are symlinked into agent-native dirs
shopt -s nullglob

AGENTS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$AGENTS_DIR/.." && pwd)"
TARGETS=(".claude/skills" ".cursor/skills" ".codex/skills")

mode="${1:-}"

fail=0

# Ensure target directories exist for the check
for t in "${TARGETS[@]}"; do
  mkdir -p "$REPO_ROOT/$t"
done

# For each skill, verify symlink in each target
for skill_dir in "$AGENTS_DIR"/skills/*/; do
  [ -d "$skill_dir" ] || continue
  name="$(basename "$skill_dir")"
  expected="../../.agents/skills/$name"

  for target in "${TARGETS[@]}"; do
    dest="$REPO_ROOT/$target/$name"
    if [ "$mode" = "check" ]; then
      if [ ! -L "$dest" ]; then
        echo "Missing symlink: $dest"
        fail=1
        continue
      fi
      actual="$(readlink "$dest")"
      if [ "$actual" != "$expected" ]; then
        echo "Wrong target for $dest: $actual (expected: $expected)"
        fail=1
      fi
    else
      if [ -L "$dest" ]; then
        echo "OK: $dest -> $(readlink "$dest")"
      elif [ -e "$dest" ]; then
        echo "ERROR: $dest exists but is not a symlink"
        fail=1
      else
        echo "MISSING: $dest"
        fail=1
      fi
    fi
  done
done

# Detect stale symlinks that point into .agents but have no corresponding skill
for target in "${TARGETS[@]}"; do
  dir="$REPO_ROOT/$target"
  for link in "$dir"/*; do
    [ -L "$link" ] || continue
    ttarget="$(readlink "$link")"
    case "$ttarget" in
      *"/.agents/skills/"*)
        name="$(basename "$link")"
        if [ ! -d "$AGENTS_DIR/skills/$name" ]; then
          echo "Stale symlink: $link -> $ttarget (skill missing)"
          fail=1
        fi
        ;;
    esac
  done
done

if [ $fail -ne 0 ]; then
  echo "Skill link check failed"
  exit 1
else
  echo "All skills are linked correctly"
  exit 0
fi
