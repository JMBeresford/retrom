# AGENTS.md

## Project summary

`retrom-rest-service` contains the REST (non-gRPC) service handlers for Retrom. It exposes the
HTTP-facing API layer for the service and supports the app's web and client integration patterns.

## Status

Active.

## Key relationships

- Complements the core `retrom-service` and other service crates
- Exposes HTTP handlers and request/response handling for clients or tooling
- Depends on generated contracts and service abstractions rather than directly on UI code

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-rest-service:cargo:format`
- `pnpm nx run retrom-rest-service:cargo:lint`

## Important guidance

- Keep HTTP contracts explicit and backward-compatible when possible.
- Prefer targeted endpoint changes over broad routing refactors.
- If a contract change affects clients, update those integrations as part of the same change.
