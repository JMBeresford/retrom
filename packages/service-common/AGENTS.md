# AGENTS.md

## Project summary

`retrom-service-common` contains the shared utilities and common service patterns used across the
Retrom backend. This crate is intentionally foundational and reusable rather than domain-specific.

## Status

Active.

## Key relationships

- Shared dependency for multiple service crates
- Holds common utilities, patterns, and support logic for backend work
- Should stay generic and low-level rather than specific to one feature domain

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-service-common:cargo:format`
- `pnpm nx run retrom-service-common:cargo:lint`

## Important guidance

- Changes here are high-impact because they affect many service crates.
- Keep abstractions generic and stable unless the change is intentional and cross-cutting.
- Prefer narrow, reusable utilities over broad helper expansions.
