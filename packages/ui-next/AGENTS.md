# AGENTS.md

## Project summary

`@retrom/ui-next` is the active shared UI package for the Retrom frontend. It provides reusable
components, hooks, utils, styling primitives, and Tailwind-based design-system building blocks.

## Status

Active.

## Key relationships

- Consumed by front-end applications in the Retrom monorepo
- Uses shared workspace config from `@retrom/configs`
- Fits into the pattern of reusable UI primitives rather than app-specific logic

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run ui-next:prettier:format`
- `pnpm nx run ui-next:eslint:lint`
- `pnpm nx run ui-next:build`
- validate downstream consumer packages

## Important guidance

- Keep this package generic and reusable; avoid app-specific logic.
- Preserve public exports and styling contracts when modifying component APIs.
- Favor small, composable component changes over broad layout refactors.
