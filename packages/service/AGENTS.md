# AGENTS.md

## Project summary

`retrom-service` implements the core Retrom service layer and wires together the individual gRPC
service implementations generated from the `retrom-codegen` crate.

## Status

Active.

## Key relationships

- Depends on generated contracts and the service-specific crate implementations
- Coordinates the gRPC service surface exposed by the backend

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-service:cargo:format`
- `pnpm nx run retrom-service:cargo:lint`

## Important guidance

- Keep this crate focused on the service composition and gRPC boundary.
- Avoid mixing in unrelated orchestration or UI logic.
- When modifying generated contracts, validate the downstream service implementations together.
