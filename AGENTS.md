# AGENTS.md

Project agent-agnostic instructions and agent assets index.

This repository follows the Agent-Agnostic Repository Guide. Reusable agent assets live under `.agents/`.

Use `.agents/scripts/link-skills.sh` to create symlinks for skills into agent-native directories (e.g. `.claude`, `.cursor`, `.codex`) and `.agents/scripts/sync-mcp.sh` to render per-agent MCP configs. See `.agents/AGENTS.md` for repository-maintenance details.

---

## Packages

| Package | Description |
|---------|-------------|
| `packages/client-web` | Current production Tauri + Vite SPA (React 18, TanStack Router, TanStack Query) |
| `packages/client-web-next` | Next-generation SSR web client (TanStack Start, React 19). See `packages/client-web-next/AGENTS.md` for full context. |

### client-web-next

Scaffolded with:

```bash
npx @tanstack/cli@latest create my-tanstack-app \
  --agent --package-manager pnpm --tailwind --toolchain eslint \
  --add-ons tanstack-query,form
```

Then `npx @tanstack/intent@latest install` and `npx @tanstack/intent@latest list` were run to wire TanStack Intent skills.

Stack: TanStack Start · Router · Query · Form · Hotkeys · Virtual · React 19 · TypeScript 6 · Vite 8 · Tailwind CSS 4.

Dev: `pnpm nx dev retrom-client-web-next` (port 3001).
