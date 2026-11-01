# AGENTS.md

## Project summary

`retrom-telemetry` provides shared telemetry and observability utilities for Retrom packages. It is
a cross-cutting infrastructure crate rather than a user-facing feature area.

## Status

Active.

## Key relationships

- Used by service and runtime crates to standardize logging and observability
- Supports diagnosis and instrumentation across the backend and clients
- Shared low-level utility crate used by many domains

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-telemetry:cargo:format`
- `pnpm nx run retrom-telemetry:cargo:lint`

## Important guidance

- Keep telemetry changes focused on observability and diagnostics.
- Avoid adding noisy or expensive logging to core hot paths without a clear purpose.
- Changes here can affect many packages, so keep the behavior predictable and low-risk.
