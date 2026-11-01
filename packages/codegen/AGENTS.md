# AGENTS.md

## Project summary

`@retrom/codegen` centralizes generated code and protocol artifacts used across the workspace. It is
the package responsible for Buf/protobuf-derived TypeScript+Rust output and related generated API
contracts.

## Status

Active.

## Key relationships

- Used by service, client and plugin packages that rely on generated contracts
- Serves as the canonical source for generated types and message definitions

## Typical edit locations

- `src/`
- `protos/`

## Validation

- ensure format target success: `pnpm nx run retrom-codegen:buf:format`
- ensure lint target success: `pnpm nx run retrom-codegen:buf:lint`
- ensure build target success: `pnpm nx run retrom-codegen:build`
- validate downstream consumers that import the generated artifacts

## Important guidance

- Do not hand-edit generated output
- Treat protocol changes as cross-package changes; update consuming packages when necessary.
- Prefer regeneration over manual patching for schema or contract updates.
