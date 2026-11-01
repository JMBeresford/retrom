# AGENTS.md

> Deprecated: This package is no longer maintained and should not be used as the basis for new work
> unless explicitly instructed by a maintainer.

## Project summary

`@retrom/client-web` is the legacy web/desktop client implementation. It remains in the repo for
historical reference and compatibility, but it is not the active target for ongoing feature work.

## Status

Deprecated.

## Key relationships

- Historical client implementation only
- Active frontend work should prefer `packages/client-web-next`
- Any changes here should be explicitly requested and narrowly scoped

## Typical edit locations

- legacy client source files
- old UI and state-management code
- historical app configuration and routing files

## Validation

- only run targeted validation when a request explicitly requires a legacy fix
- prefer modern package targets when checking behavior or feature parity

## Important guidance

- Do not reference this package as an active path for new work.
- Treat it as archived code with historical context only.
- If a task mentions modern Retrom client work, assume it refers to `client-web-next`, not this package.
