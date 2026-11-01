# AGENTS.md

## Project summary

`retrom-db` is the database layer for Retrom. It defines migrations, persistence boundaries and data
access for the application's storage and query needs.

## Status

Active.

## Key relationships

- Underpins service-layer data access
- Used by higher-level service crates rather than directly by UI code

## Typical edit locations

- `src/`
- `migrations/`

## Validation

- `pnpm nx run retrom-db:cargo:format`
- `pnpm nx run retrom-db:cargo:lint`

## Important guidance

- Treat schema and query changes as cross-cutting changes that can affect many service consumers.
- Prefer narrow migrations and repository changes over broad data model rewrites.
- Keep persistence contracts explicit and compatible with the rest of the service layer.
