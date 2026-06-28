# .agents/

The agents architecture and conventions of this repository are based on the following references:

- [Agent-Agnostic Repository Guide](https://gist.github.com/davidgibsonp/337be9b80b3f03eccd188235c287bb05)

Agent-agnostic configuration following the Agent Skills and AGENTS.md conventions.

Layout

- skills/ — Shared skills (committed). Each is a directory with SKILL.md.
- skills-local/ — Private skills (gitignored).
- mcp/servers.json — Canonical MCP server config.
- scripts/ — Sync and validation scripts (link-skills.sh, sync-mcp.sh).

Adding a skill

1. Create `.agents/skills/<name>/SKILL.md` with `name` + `description` frontmatter
2. Run `.agents/scripts/link-skills.sh`
3. Commit the skill directory (symlinks are machine-local by default)

MCP

Edit `.agents/mcp/servers.json` and run `.agents/scripts/sync-mcp.sh` to render per-agent MCP files.
