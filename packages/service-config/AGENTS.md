# AGENTS.md

## Project summary

`retrom-service-config` implements the `ConfigService` gRPC service as defined in the
`retrom-codegen` crate.

## Status

Active.

## Key relationships

- Depends on generated contracts and shared service utilities

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-service-config:cargo:format`
- `pnpm nx run retrom-service-config:cargo:lint`

## Important guidance

- Keep this crate focused on the gRPC `ConfigService` implementation.
- Avoid mixing this crate with unrelated service orchestration.
- When modifying service contracts, validate downstream consumers and client handlers together.
