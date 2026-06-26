#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AGENTS_DIR="$REPO_ROOT/.agents"
TARGET_DIR="$REPO_ROOT/.github/agents/skills"

mkdir -p "$TARGET_DIR"

echo "Linking skills from $AGENTS_DIR/skills to $TARGET_DIR"

for skill_dir in "$AGENTS_DIR"/skills/*/; do
  [ -d "$skill_dir" ] || continue
  name="$(basename "$skill_dir")"
  target="../../.agents/skills/$name"
  link_path="$TARGET_DIR/$name"

  if [ -L "$link_path" ]; then
    if [ "$(readlink "$link_path")" = "$target" ]; then
      echo "Already linked: $link_path -> $target"
      continue
    else
      rm "$link_path"
    fi
  fi

  if [ -e "$link_path" ]; then
    echo "ERROR: $link_path exists and is not a symlink" >&2
    exit 1
  fi

  ln -s "$target" "$link_path"
  echo "Linked: $link_path -> $target"
done

# Prune stale symlinks
for link in "$TARGET_DIR"/*/; do
  [ -L "${link%/}" ] || continue
  link_path="${link%/}"
  target="$(readlink "$link_path")"
  if [[ "$target" == *"/.agents/"* ]]; then
    name="$(basename "$link_path")"
    if [ ! -d "$AGENTS_DIR/skills/$name" ]; then
      rm "$link_path"
      echo "Pruned stale symlink: $link_path"
    fi
  fi
done
