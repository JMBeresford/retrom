# AGENTS.md

## Project summary

`retrom-service-metadata` implements the `MetadataService` gRPC service as defined in the
`retrom-codegen` crate.

## Status

Active.

## Key relationships

- Depends on generated contracts and shared service utilities

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-service-metadata:cargo:format`
- `pnpm nx run retrom-service-metadata:cargo:lint`

## Important guidance

- Keep this crate focused on the gRPC `MetadataService` implementation.
- Avoid mixing this crate with unrelated service orchestration.
- When modifying service contracts, validate downstream consumers and client handlers together.
