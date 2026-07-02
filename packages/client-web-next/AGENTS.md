# AGENTS.md — client-web-next

<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only before the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

---

## Project Overview

`packages/client-web-next` is the next-generation Retrom web client, built on
**TanStack Start** (SSR-first React meta-framework). It was scaffolded with the
TanStack CLI and extended to demonstrate the full TanStack ecosystem used by
this monorepo.

---

## Scaffold Commands

```bash
# 1. Scaffold (run in a scratch directory, then merged into packages/client-web-next)
npx @tanstack/cli@latest create my-tanstack-app \
  --agent \
  --package-manager pnpm \
  --tailwind \
  --toolchain eslint \
  --add-ons tanstack-query,form

# 2. Wire TanStack Intent skill mappings
npx @tanstack/intent@latest install

# 3. List available skills
npx @tanstack/intent@latest list
```

> **Note:** The `--tailwind` flag is deprecated and silently ignored by the CLI
> (Tailwind is always enabled). It was included as specified in the task.

---

## Chosen Stack

| Concern         | Library / Tool                            |
|-----------------|-------------------------------------------|
| Framework       | `@tanstack/react-start` (SSR)             |
| Routing         | `@tanstack/react-router` (file-based)     |
| Async state     | `@tanstack/react-query`                   |
| Forms           | `@tanstack/react-form`                    |
| Keyboard        | `@tanstack/react-hotkeys`                 |
| Virtualisation  | `@tanstack/react-virtual`                 |
| Tooling         | `@tanstack/intent`, `@tanstack/cli`       |
| Styling         | Tailwind CSS v4                           |
| Linting         | ESLint 9 + `@tanstack/eslint-config`      |
| Formatting      | Prettier 3                                |
| Language        | TypeScript 6 / React 19                   |
| Bundler         | Vite 8                                    |

---

## Demo Routes

| Route                  | Demonstrates                                   |
|------------------------|------------------------------------------------|
| `/`                    | Home — stack overview with links to all demos  |
| `/about`               | About page — TanStack Start SSR shell          |
| `/demo/tanstack-query` | `useQuery` with a resolved-promise data source |
| `/demo/form/simple`    | Simple Zod-validated form via `createFormHook` |
| `/demo/form/address`   | Nested fields, field-level validation, select  |
| `/demo/hotkeys`        | `useHotkeys`, `HotkeysProvider`, registration table |
| `/demo/virtual`        | `useVirtualizer` over 10 000 rows with filter + sort |

---

## Development

```bash
# From the repo root
pnpm nx dev retrom-client-web-next

# Or directly from the package directory
pnpm dev        # http://localhost:3001
pnpm build
pnpm preview
pnpm test
pnpm lint
pnpm format
pnpm generate-routes   # re-generate src/routeTree.gen.ts
```

> Port `3001` is used to avoid colliding with `client-web` on `3000`.

---

## Dependency Notes

This package intentionally does **not** use `catalog:` references from the
workspace root because it requires newer versions than those pinned in the
workspace catalog:

| Package      | Workspace catalog | This package |
|--------------|-------------------|--------------|
| `react`      | `^18`             | `^19.2.0`    |
| `typescript` | `5.9.2`           | `^6.0.2`     |
| `vite`       | `^7.0.0`          | `^8.0.0`     |

Run `pnpm install` from the repo root to install this package alongside the
rest of the workspace.

---

## Environment Variables

No environment variables are required to run the dev server.

When connecting to a Retrom backend (future integration), set:

```bash
VITE_RETROM_SERVER_URL=http://localhost:5101   # gRPC-Web / REST endpoint
```

---

## Architectural Decisions

- **TanStack CLI output preserved as-is**: `src/integrations/tanstack-query/`,
  `src/hooks/demo.form*.ts`, and `src/components/demo.FormComponents.tsx` are
  lifted directly from the CLI scaffold.
- **Router context carries `QueryClient`**: `getRouter()` in `src/router.tsx`
  uses `createRootRouteWithContext<{ queryClient: QueryClient }>()` so every
  route loader has type-safe access to the query client.
- **`routeTree.gen.ts` is committed**: Because `tsr generate` requires
  node_modules, the initial tree is committed and will be overwritten on first
  `pnpm generate-routes` after install.
- **Separate port (3001)**: avoids collision with the existing `client-web`
  package on port 3000.

---

## Known Gotchas

- **React 19 / workspace conflict**: The workspace root `overrides.react` is
  absent; pnpm resolves the correct React 19 inside this package's subtree.
- **TanStack Intent list warning**: version conflict on
  `@tanstack/devtools-event-client` (0.4.4 vs 0.5.0) is cosmetic — the CLI
  picks the higher version automatically.
- **`--tailwind` flag deprecated**: The CLI ignores this flag since Tailwind is
  always included; it was passed as specified to preserve the exact command.

---

## Next Steps

- [ ] Replace demo data sources with real Retrom gRPC-Web calls via
  `@retrom/codegen`
- [ ] Add authentication using `start-core/auth-server-primitives` skill
- [ ] Add protected routes with `router-core/auth-and-guards` skill
- [ ] Add server functions (`createServerFn`) for mutations
- [ ] Set up deployment target (Cloudflare / Node / Docker) via
  `start-core/deployment` skill
- [ ] Migrate existing `client-web` pages incrementally to this package
