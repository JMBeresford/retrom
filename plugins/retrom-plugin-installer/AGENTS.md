# AGENTS.md

## Project summary

`@retrom/plugin-installer` handles installer-related behavior and the interaction between
client-side installation flows and Retrom's service layer.

## Status

Active.

## Key relationships

- Relies on Tauri APIs and generated contract types
- Connects installation actions to higher-level app or launcher flows
- Should stay focused on install behavior and checks, not broad UI logic

## Typical edit locations

- `src/`
- `guest-js/`

## Validation

- `pnpm nx run plugin-installer:prettier:format`
- `pnpm nx run plugin-installer:eslint:lint`
- `pnpm nx run plugin-installer:build`
- `pnpm nx run plugin-installer:cargo:lint`
- `pnpm nx run plugin-installer:cargo:build`

## Important guidance

- Keep install semantics explicit and deterministic.
- Favor narrow fixes over broad refactors of installation behaviors.
- If the change alters contracts, check all call sites that depend on them.
