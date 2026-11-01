# AGENTS.md

## Project summary

`@retrom/plugin-standalone` supports running the Retrom desktop client in standalone mode, enabling
it to operate without a full service connection. It provides the necessary runtime and integration
support for standalone execution by managing a server instance locally.

## Status

Active.

## Key relationships

- Integrates standalone app behavior with Tauri and generated contract interfaces
- Works alongside launcher and service integrations
- Keeps runtime assumptions separate from UI code

## Typical edit locations

- `src/`
- `guest-js/`

## Validation

- `pnpm nx run plugin-standalone:prettier:format`
- `pnpm nx run plugin-standalone:eslint:lint`
- `pnpm nx run plugin-standalone:cargo:lint`
- `pnpm nx run plugin-standalone:build`
- `pnpm nx run plugin-standalone:cargo:build`

## Important guidance

- Keep this package constrained to standalone-mode behavior.
- Avoid mixing in unrelated app or service logic.
- Document any platform-specific assumptions clearly when they affect launch or execution behavior.
