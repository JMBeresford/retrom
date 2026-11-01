# AGENTS.md

## Project summary

`@retrom/configs` provides the shared tooling configuration used across the workspace. It keeps
project conventions aligned and reduces drift between packages.

## Status

Active.

## Key relationships

- Used by many packages in the monorepo
- This package owns standard workspace configuration conventions rather than app logic
- Changes here can affect multiple projects at once

## Typical edit locations

- `eslint/`
- `tsconfig/`
- `vite/`

## Validation

- `pnpm nx run retrom-configs:prettier:format`
- `pnpm nx run retrom-configs:eslint:lint`
- `pnpm nx run retrom-configs:build`
- validate downstream consumers that import the shared configs

## Important guidance

- Change config only when the impact is intentional and understood.
- Prefer the smallest config change that solves the issue.
- Avoid broad formatting or lint rule churn without a clear repo-wide benefit.
