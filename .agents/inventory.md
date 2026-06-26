Agent config inventory and classification

Scanned paths (depth ≤ 4)

- .agents/AGENTS.md
- .agents/mcp/servers.json
- .agents/scripts/link-skills.sh
- .agents/scripts/sync-mcp.sh
- .agents/skills/* (SKILL.md files)
- .github/agents/*.agent.md
- .github/agents/mcp.json
- .github/agents/skills/* -> symlinks to .agents/skills/
- .github/instructions/*.instructions.md
- .github/copilot-instructions.md
- .github/workflows/copilot-setup-steps.yml

Classification & recommended action

1) .agents/* (current canonical)
   - Category: Portable / Canonical
   - Action: Keep as canonical source. Do not generate from elsewhere.
   - Files: .agents/AGENTS.md, .agents/skills/*/SKILL.md, .agents/mcp/servers.json, scripts/

2) .github/instructions/*.instructions.md and .github/copilot-instructions.md
   - Category: Portable (project-level instructions)
   - Action: Merge or move content into top-level AGENTS.md (repo root) or reference it from AGENTS.md. Keep a short agent-specific pointer file (e.g., .github/copilot-instructions.md -> "@AGENTS.md" + Copilot-only overrides) if needed.

3) .github/agents/*.agent.md (existing Copilot/GitHub agent descriptors)
   - Category: Generated (same data, agent-native format) OR Agent-specific when format is Copilot-only
   - Action: Treat these as agent-native outputs generated from canonical sources in .agents/. Use sync-mcp.sh / link-skills.sh to produce or symlink these. If any .agent.md files contain Copilot-only hooks with no portable equivalent, mark their unique sections as Agent-specific and leave them in place.

4) .github/agents/mcp.json
   - Category: Generated
   - Action: Generate from .agents/mcp/servers.json using sync-mcp.sh (done).

5) .github/agents/skills/ symlinks
   - Category: Generated (symlinks)
   - Action: Keep symlinks created by link-skills.sh. If the repo prefers committed symlinks, keep them; otherwise allow scripts to recreate them in CI.

6) .github/workflows/copilot-setup-steps.yml
   - Category: Agent-specific usage in CI
   - Action: Leave in place (GitHub Actions workflow). If it references agent-generated files, update references to the generated outputs or canonical locations as needed.

Notes & follow-ups

- Some files under .github/agents/*.agent.md appear to be SKILL-like docs but in Copilot/GitHub format. Confirm whether they’re hand-edited in future; if so, converge their content into .agents/skills/<name>/SKILL.md and keep a small agent-native wrapper if necessary.
- The repo contains workflows that reference Copilot setup steps; those workflows should be validated after migration.

Inventory produced at: .agents/inventory.md
