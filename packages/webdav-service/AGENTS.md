# AGENTS.md

## Project summary

`retrom-webdav-service` provides the WebDAV service handlers for Retrom. It is responsible for the
remote storage/protocol side of WebDAV interactions and supports storage-oriented integration flows.

## Status

Active.

## Key relationships

- Integrates with the broader service layer and remote storage capabilities
- Works alongside the WebDAV client plugin for end-to-end remote access
- Keeps network-based storage logic isolated from app UI concerns

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-webdav-service:cargo:format`
- `pnpm nx run retrom-webdav-service:cargo:lint`

## Important guidance

- Keep remote storage contracts explicit and robust.
- Prefer narrow protocol or handler updates over broad refactors.
- When changing WebDAV behavior, review both the service-side implementation and the client plugin
  that consumes it.
