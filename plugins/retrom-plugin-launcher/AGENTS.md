# AGENTS.md

## Project summary

`@retrom/plugin-launcher` encapsulates launch behavior for games, providing the bridge between
Retrom's higher-level flows and the underlying launch integration layer.

## Status

Active.

## Key relationships

- Depends on generated contracts and Tauri APIs
- Coordinates launch actions that other app surfaces invoke
- Operates as a core behavioral integration rather than a presentation package

## Typical edit locations

- `src/`
- `guest-js/`

## Validation

- `pnpm nx run plugin-launcher:prettier:format`
- `pnpm nx run plugin-launcher:eslint:lint`
- `pnpm nx run plugin-launcher:build`
- `pnpm nx run plugin-launcher:cargo:lint`
- `pnpm nx run plugin-launcher:cargo:build`

## Important guidance

- Keep launch behavior explicit and resilient to platform differences.
- Avoid app-specific UI concerns in this package.
- If the change alters launch contracts or assumptions, review all related plugin consumers.
