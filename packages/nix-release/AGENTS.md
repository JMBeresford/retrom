# AGENTS.md

## Project summary

`@retrom/nix-release` is a semantic-release plugin that generates Nix packaging artifacts for Retrom
releases. It is a packaging and release support package, not a user-facing runtime component.

## Status

Active internal tooling.

## Key relationships

- Supports Nix release automation and packaging outputs
- Uses the shared workspace tooling and release conventions
- Produces generated package metadata that downstream release flows consume

## Typical edit locations

- `src/`

## Validation

- `pnpm nx run retrom-nix-release:prettier:format`
- `pnpm nx run retrom-nix-release:eslint:lint`
- `pnpm nx run retrom-nix-release:build`
- `pnpm exec semantic-release --dry-run` from repo root to validate release behavior

## Important guidance

- This project should stay focused on release generation and packaging semantics.
- Keep changes narrow and release-specific; avoid unrelated app logic here.
