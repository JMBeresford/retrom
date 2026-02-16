# Retrom - Game Library Management Application

A TypeScript and Rust based monorepo for a game library management application.

## Repository Overview

This monorepo uses a **dual-workspace structure**:

- **PNPM workspace** for TypeScript/JavaScript packages
- **Cargo workspace** for Rust packages
- **NX** for task orchestration and caching

## High-Level Architecture

**Frontend**:

- Desktop application (Tauri + React)
- Web client (React SPA with TanStack Router)
- Shared UI component library

**Backend**:

- Combined service binary (gRPC + REST)
- PostgreSQL database with Diesel ORM
- Optional embedded mode for standalone deployment

**Code Generation**:

- Protocol Buffers for API definitions
- Buf for code generation (TypeScript + Rust)

## Directory Structure

The monorepo contains workspace packages in `packages/` and Tauri plugins in `plugins/`.
Each package may be a TypeScript package, Rust package, or both. The `docs/` directory is
a git submodule containing user documentation, and `docker/` contains containerization
configurations.

## Core Tooling

**NX** - Task runner and monorepo orchestrator

- Run targets: `pnpm nx <target> <package>`
- Multiple packages: `pnpm nx run-many -t <target1> <target2>`
- Sync workspace: `pnpm nx sync` (required before commits)

**Package Managers**:

- PNPM for TypeScript packages
- Cargo for Rust packages

**Formatters**:

- Prettier (TypeScript/JavaScript/JSON/Markdown)
- Rustfmt (Rust)
- Buf (Protobuf)

**Linters**:

- ESLint with typescript-eslint (TypeScript)
- Clippy (Rust)

## Key Technologies

**TypeScript**:

- React 18, TanStack Router, TanStack Query, Zustand
- Radix UI, Tailwind CSS v4, Vite
- Tauri plugins for desktop integration

**Rust**:

- Tauri 2.x, Tokio, Diesel, diesel-async
- Tonic (gRPC), Axum (REST), OpenTelemetry
- Never use unsafe code

**Communication**:

- Protocol Buffers for API definitions
- Connect-RPC (gRPC-Web) for browser clients
- Tonic for server-side gRPC

## Pre-Commit Requirements

Before committing changes:

1. **Sync NX workspace**: `pnpm nx sync`
2. **Format code**:
   - TypeScript: `pnpm nx run-many -t prettier:format`
   - Rust: `pnpm nx run-many -t cargo:format`
3. **Lint code**:
   - TypeScript: `pnpm nx run-many -t eslint:lint`
   - Rust: `pnpm nx run-many -t cargo:lint`
4. **Type check**: `pnpm nx run-many -t typecheck` (TypeScript)
5. **Run tests**: `pnpm nx run-many -t cargo:test` (for affected packages)
6. **Update documentation**: If changes affect documented features

## Common Commands

```bash
# Development
pnpm nx dev client-web          # Start web dev server
pnpm nx dev client              # Run Tauri app
pnpm nx cargo:run service       # Run backend service

# Building
pnpm nx build <package>         # Build package
pnpm nx cargo:build <package>   # Build Rust package

# Code quality
pnpm nx run-many -t prettier:format cargo:format  # Format all
pnpm nx run-many -t eslint:lint cargo:lint        # Lint all
pnpm nx run-many -t typecheck                     # Type check TS

# Testing
pnpm nx cargo:test <package>    # Test Rust package
pnpm nx cargo:test <package> -- --nocapture       # With output

# Check formatting without modifying
pnpm nx run-many -t prettier:format --configuration check
pnpm nx run-many -t cargo:format --configuration check
```

## Development Workflow

1. Pull latest changes: `git pull`
2. Install dependencies: `pnpm install`
3. Sync workspace: `pnpm nx sync`
4. Make changes
5. Run pre-commit checks (see above)
6. Commit and push

## Additional Documentation

Specialized instructions are available in `.github/instructions/`:

- Language-specific guides (TypeScript, Rust)
- Testing patterns and requirements
- Monorepo and tooling details
- Docker and deployment
- Protocol Buffers and code generation

These files are discovered contextually by AI agents based on the work being done.
