# AGENTS.md

## Project summary

`retrom-client` is the native desktop client crate for Retrom. It is the Rust/Tauri-facing client
entry point for the desktop app and is responsible for integrating the UI shell, launcher flows,
and runtime service communication.

## Status

Active.

## Key relationships

- Coordinates the native desktop runtime for Retrom
- Uses the service-layer crates and generated contracts to talk to the app back end
- Works alongside the web client packages, especially the active `client-web-next` app

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-client:cargo:format`
- `pnpm nx run retrom-client:cargo:lint`

## Important guidance

- Keep this crate focused on native client/runtime behavior rather than app-specific UI logic.
- When changing service contracts or launcher behavior, check the relevant consumer crates.
- Prefer the active web client package for browser-facing UI work unless the task is explicitly
  about the desktop runtime.
