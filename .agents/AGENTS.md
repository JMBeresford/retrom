# .agents/

Agent-agnostic configuration for this repository.

This directory holds portable, canonical agent assets and sync scripts per the Agent-Agnostic Repository Guide: https://gist.github.com/davidgibsonp/337be9b80b3f03eccd188235c287bb05

Layout

- skills/                  # Shared skills (committed)
- skills-local/            # Private skills (gitignored)
- mcp/servers.json         # Canonical MCP server definitions
- scripts/link-skills.sh   # Create symlinks to agent-native skill dirs
- scripts/sync-mcp.sh      # Render agent-native MCP/adapter configs

Usage

- Add shared skills to .agents/skills/<name>/SKILL.md
- Run .agents/scripts/link-skills.sh to create symlinks into agent-native dirs (e.g., .github/agents/skills)
- Edit .agents/mcp/servers.json and run .agents/scripts/sync-mcp.sh to generate agent-native MCP files

Maintainers: follow the scripts' README and keep generated files committed. The scripts support a 'check' mode for CI (exit non-zero if generated outputs are stale).