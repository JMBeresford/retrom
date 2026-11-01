# AGENTS.md

## Project summary

`@retrom/plugin-webdav-client` provides WebDAV transport support for Retrom's networked storage or
service integrations. It handles the client side of remote file access and sync-oriented behavior.

## Status

Active.

## Key relationships

- Integrates remote storage transport with Retrom's client/plugin architecture
- Depends on Tauri and service-layer contracts for transport boundaries
- Keeps network-specific behavior isolated from UI or app orchestration logic

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

- Treat storage transport behavior as a strict contract boundary.
- Keep remote error handling and sync assumptions explicit.
- Prefer narrow fixes around the WebDAV client, not broad changes to unrelated app flows.
