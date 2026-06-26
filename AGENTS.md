# AGENTS.md

Project agent-agnostic instructions and agent assets index.

This file is the canonical, engine-agnostic entry point for AI agents and humans seeking repository context, conventions, and agent workflows. It consolidates project guidance previously stored under .github/copilot-instructions.md and .github/instructions/. For agent-specific adapters and runtime files, see the agent-native directories (e.g., .github/agents/).

Contents

- Project overview and architecture
- Workspace and tooling conventions (NX, PNPM, Cargo)
- Pre-commit and CI expectations
- Where to find agent skills and MCP definitions (.agents/skills, .agents/mcp)
- How to add or update skills and MCP entries (use .agents/scripts)

Quick start for agents and maintainers

- Repository root is the authoritative context. Read this file for project-level conventions.
- Shared agent skills: .agents/skills/<skill>/SKILL.md
- Canonical MCP servers: .agents/mcp/servers.json
- To sync: run .agents/scripts/link-skills.sh and .agents/scripts/sync-mcp.sh

Agent-specific pointers

Agent-specific wrapper files remain in agent-native directories to support vendor features and local overrides. Examples:

- .github/copilot-instructions.md — Copilot-specific pointer and overrides (now references @AGENTS.md)
- .github/agents/* — Generated or symlinked agent assets (kept as output of .agents/scripts)

Migration notes

- The canonical content formerly in .github/copilot-instructions.md and .github/instructions/*.instructions.md has been consolidated here. Agent-specific pointers in their original locations now reference this file and may include small vendor-only overrides.

Maintainers

- To add a shared skill: create .agents/skills/<name>/SKILL.md with frontmatter `name` and `description`, then run .agents/scripts/link-skills.sh and commit the new skill.
- To add an MCP server: edit .agents/mcp/servers.json and run .agents/scripts/sync-mcp.sh (or `sync-mcp.sh check` in CI to validate).

See .agents/AGENTS.md for the .agents directory self-management doc and detailed scripts usage.

Developer checks

- Local: Before opening a PR that touches agent skills or MCP configuration, run:

  ```bash
  .agents/scripts/link-skills.sh
  .agents/scripts/sync-mcp.sh check
  ```

  The `link-skills.sh` script creates symlinks from .agents/skills into the agent-native directory (.github/agents/skills). The `sync-mcp.sh check` command validates that the generated MCP file (.github/agents/mcp.json) matches the canonical .agents/mcp/servers.json and exits non-zero if stale.

- CI: The repository includes a GitHub Actions job that runs the same checks on pull requests to ensure generated agent assets are up-to-date. If that job fails, run the scripts above and commit the updated generated outputs.

Maintainers should avoid committing ephemeral or machine-local overrides; keep canonical content in .agents/ and small vendor-specific pointers in agent-native directories.