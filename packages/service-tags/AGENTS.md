# AGENTS.md

## Project summary

`retrom-service-tags` implements the `TagService` gRPC service as defined in the
`retrom-codegen` crate.

## Status

Active.

## Key relationships

- Depends on generated contracts and shared service utilities

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-service-tags:cargo:format`
- `pnpm nx run retrom-service-tags:cargo:lint`

## Important guidance

- Keep this crate focused on the gRPC `TagService` implementation.
- Avoid mixing this crate with unrelated service orchestration.
- When modifying service contracts, validate downstream consumers and client handlers together.
