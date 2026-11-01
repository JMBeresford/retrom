# AGENTS.md

## Project summary

`@retrom/plugin-steam` integrates Steam-related metadata, library, or platform-specific behavior
into Retrom's desktop client.

## Status

Active.

## Key relationships

- Connects client-local Steam library data to Retrom's desktop client
- Uses Tauri and service integration patterns rather than UI composition
- Typically depends on platform- or provider-specific assumptions

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

- Keep external provider assumptions explicit and isolated.
- Avoid broad refactors that obscure provider-specific behavior.
- If the contract changes, review the callers that parse or use this data.
