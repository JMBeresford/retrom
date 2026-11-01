# AGENTS.md

## Agent-Agnostic Repository Guide

Project agent-agnostic instructions and agent assets index.

This repository follows the Agent-Agnostic Repository Guide. Reusable agent assets live under
`.agents/`.

Use `.agents/scripts/link-skills.sh` to create symlinks for skills into agent-native directories
(e.g. `.claude`, `.cursor`, `.codex`) and `.agents/scripts/sync-mcp.sh` to render per-agent MCP
configs. See `.agents/AGENTS.md` for repository-maintenance details.

## Repository Summary

Retrom is a centralized game library and collection management service focused on emulation and
self-hosted gaming workflows. The repo is a monorepo spanning the runtime server/service layer, web
and desktop clients, shared libraries, release packaging, and plugin integrations.

At a high level, the project combines:

- a Rust/Cargo backend and service layer
- TypeScript/React clients, including web client and a desktop client built with Tauri
- reusable UI component packages and code-generation/config packages
- plugin packages for desktop client logic and state management
- Nx-based workspace orchestration and release infrastructure

## Monorepo Layout

- `packages/` — Rust and/or TypeScript packages for the backend, clients, and shared libraries
- `plugins/` — Desktop client plugin packages for state management and integrations
- `docs/` — project documentation, design notes, and reference materials
- `docker/` — containerization and deployment assets for local or hosted service setups
- `nix/` — Nix-based environment and packaging configuration
- `templates/` — project templates and generated manifests used in packaging or release flows
- root config files (`package.json`, `nx.json`, `Cargo.toml`, `tsconfig.json`, etc.) — workspace
  orchestration, dependency management, build configuration, and global tooling setup
- `.agents/` — shared skills, MCP server config, and synchronization tooling for agent workflows

## Build and Test Commands

Use the workspace root and Nx for repo-level validation when possible. Key examples from this repo:

- `pnpm install` — install workspace dependencies
- `pnpm nx dev retrom-client-web-next` — run the Next web client in development mode
- `pnpm nx run <project>:build` / `:test` / `:lint` — use project-scoped Nx targets where available
- `pnpm markdownlint-cli2 '**/*.md' '#**/node_modules' '#**/dist' '#**/target'` — lint repository
  markdown files
- `.agents/scripts/link-skills.sh` — refresh local symlinks for shared skills
- `.agents/scripts/sync-mcp.sh` — regenerate per-agent MCP configs from the canonical config
- `.agents/scripts/check-links.sh` — verify the agent skill links are valid

The root `nx.json` config also defines shared targets for format, lint, typecheck, and Cargo tasks,
so prefer those commands over ad hoc scripts when a matching workspace target exists.

Each repo package should also have its own `project.json` defining local commands and Nx targets for
build, test, lint, and other package-specific tasks not covered by globals/defaults.

Do _not_ run tooling directly when an existing Nx target exists. Examples:

- Running the web client formatter

  ```sh
  # Do
  pnpm nx run retrom-client-web-next:prettier:format

  # Do
  cd projects/client-web-next && pnpm nx prettier:format

  # Don't
  pnpm prettier "projects/client-web-next/**/*.{ts,tsx,js,jsx,json,md}"

  # Don't
  cd projects/client-web-next && pnpm prettier
  ```

- Running the `service` package tests

  ```sh
  # Do
  pnpm nx run retrom-service:cargo:test

  # Do
  cd packages/service && pnpm nx cargo:test

  # Don't
  cd packages/service && cargo test

  # Don't
  cargo test --manifest-path packages/service/Cargo.toml
  ```

If no existing Nx target exists, then a package-local script or command _may_ be used, but prefer
adding a new Nx target to the package's `project.json` so that the command is discoverable and
correctly integrated into the workspace. **Always ask the user if they would like to add a new Nx
target** before creating a one-off script or command, if it makes sense to do so (e.g. running a
linter, formatter, or test suite).

## Agent Workflow and Repository Conventions

- Keep agent-specific guidance in `.agents/` instead of duplicating tool setup in multiple places.
- Prefer shared skills in `.agents/skills/` and update `.agents/mcp/servers.json` as the canonical
  source for MCP configuration.
- When adding a skill, create a directory under `.agents/skills/<name>/` with `SKILL.md` + other
  contents, then run the link script to expose it to agent-native folders.
- Keep AGENTS.md concise and actionable: explain repo structure and the most likely editing paths,
  but do not duplicate the full README or project wiki.
- Node is required to be at least 24 per the root package manifest, so use a compatible toolchain
  when running local validation. Using `nvm` is recommended for managing Node versions easily.

## Practical Guidance for Future Agents

When working in this repo, start from the package nearest to the task and prefer the smallest
relevant workspace command. For example:

- frontend/client work usually lives under `packages/client-web` or `packages/client-web-next`
- shared UI or abstraction work usually lands in `packages/ui` or `packages/ui-next`
- desktop client features and integrations belong in the matching `plugins/*` package
- release or packaging work belongs in the root release config and `packages/*-release` workspaces

This makes the repo easier to navigate while preserving the monorepo structure and agent tooling
that the project already establishes.
