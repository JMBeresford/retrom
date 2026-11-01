# AGENTS.md

## Project summary

`@retrom/client-web-next` is the active web client for Retrom. It is built with TanStack Start,
React 19, Vite, and the current shared UI package stack. The desktop client wraps this package's
build output in Tauri for native distribution, while the web client runs directly in browsers.

## Status

Active.

## Key relationships

- Owns the base client UI and state-management for both web and desktop targets
- Is a dependency of the desktop client package, which wraps it in Tauri for native distribution

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-client-web-next:prettier:format`
- `pnpm nx run retrom-client-web-next:eslint:lint`
- `pnpm nx run retrom-client-web-next:build`

## Important guidance

- Keep changes scoped to the app or feature being edited.
- Prefer workspace conventions over ad hoc client-side patterns.
