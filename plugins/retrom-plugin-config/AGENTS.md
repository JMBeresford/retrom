# AGENTS.md

## Project summary

`@retrom/plugin-config` manages desktop client configuration access and config-related interactions

## Status

Active.

## Key relationships

- Depends on generated code and Tauri API access
- Provides the configuration boundary used by the desktop app rather than the UI layer itself

## Typical edit locations

- `src/`
- `guest-js/`

## Validation

- `pnpm nx run plugin-config:prettier:format`
- `pnpm nx run plugin-config:eslint:lint`
- `pnpm nx run plugin-config:cargo:lint`
- `pnpm nx run plugin-config:build`
- `pnpm nx run plugin-config:cargo:build`

## Important guidance

- Keep configuration behavior predictable and backwards-compatible where possible.
- Preserve schema stability when modifying supported settings.
- Prefer controlled config migrations over ad hoc runtime transformation.
