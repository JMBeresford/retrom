#!/usr/bin/env bash
set -euo pipefail

# Allow the glob to expand to zero entries
shopt -s nullglob

AGENTS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$AGENTS_DIR/.." && pwd)"
TARGETS=(".claude/skills" ".cursor/skills" ".codex/skills")
valid_skills=()
add_valid() { valid_skills+=("$1"); }
is_valid() {
  for v in "${valid_skills[@]}"; do [ "$v" = "$1" ] && return 0; done
  return 1
}

for target_dir in "${TARGETS[@]}"; do
  mkdir -p "$REPO_ROOT/$target_dir"

  for skill_dir in "$AGENTS_DIR"/skills/*/; do
    [ -d "$skill_dir" ] || continue
    name="$(basename "$skill_dir")"
    add_valid "$name"
    link_target="../../.agents/skills/$name"
    link_path="$REPO_ROOT/$target_dir/$name"

    if [ -L "$link_path" ]; then
      [ "$(readlink "$link_path")" = "$link_target" ] && continue
      rm "$link_path"
    elif [ -e "$link_path" ]; then
      echo "ERROR: $link_path exists but is not a symlink." >&2
      exit 1
    fi

    ln -s "$link_target" "$link_path"
    echo "Linked: $link_path -> $link_target"
  done

  # Prune stale symlinks that point into .agents/
  for link in "$REPO_ROOT/$target_dir"/*; do
    [ -L "$link" ] || continue
    target="$(readlink "$link")"
    if [[ "$target" == *"/.agents/"* ]]; then
      name="$(basename "$link")"
      if ! is_valid "$name"; then
        rm "$link" && echo "Pruned: $link"
      fi
    fi
  done

done
