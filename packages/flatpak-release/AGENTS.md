# AGENTS.md

## Project summary

`@retrom/flatpak-release` is a semantic-release plugin for generating Flatpak metadata and related
packaging artifacts. It exists to support release automation rather than runtime product behavior.

## Status

Active internal tooling.

## Key relationships

- Supports release packaging workflows for the repository
- Produces generated release artifacts for Flatpak distribution
- Uses shared workspace configuration and release tooling conventions

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-flatpak-release:prettier:format`
- `pnpm nx run retrom-flatpak-release:eslint:lint`
- `pnpm nx run retrom-flatpak-release:build`
- `pnpm exec semantic-release --dry-run` from repo root to validate release behavior

## Important guidance

- Keep scripts deterministic and release-focused.
- Treat this as release infrastructure rather than application code.
