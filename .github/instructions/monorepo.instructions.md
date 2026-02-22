# Monorepo Instructions

## Overview

This is a dual-workspace monorepo combining TypeScript and Rust packages:

- **PNPM workspace** for TypeScript/JavaScript packages
- **Cargo workspace** for Rust packages
- **NX** for task orchestration and caching

## Workspace Structure

### PNPM Workspace

Defined in `pnpm-workspace.yaml` at the repository root.

**Workspace packages**:

- `packages/*` - Core packages (both TS and Rust)
- `plugins/*` - Tauri plugins (both TS and Rust)

**Package references**:

```json
{
  "dependencies": {
    "@retrom/ui": "workspace:*",
    "@retrom/codegen": "workspace:*"
  }
}
```

The `workspace:*` protocol ensures packages resolve to the local workspace version.

### Cargo Workspace

Defined in root `Cargo.toml` under `[workspace]`.

**Workspace members**:

- All packages with `Cargo.toml` files
- Excludes: `./packages/ui`, `./packages/configs`, `node_modules`, `dist`, `target`

**Workspace dependencies**:

```toml
[dependencies]
retrom-db = { workspace = true }
tokio = { workspace = true }
```

### Hybrid Packages

Many packages are both PNPM and Cargo workspace members:

- `packages/codegen` - Generates both TS and Rust code
- `packages/client` - Tauri app (Rust) wrapping web client (TS)
- `plugins/*` - Tauri plugins with TS and Rust components

## NX Task Orchestration

### Configuration

NX is configured via:

- `nx.json` - Global NX configuration and target defaults
- `project.json` - Per-package project configuration
- `package.json` - Root-level NX targets

### Target Definitions

Targets are defined at three levels:

**1. NX plugins** (auto-inferred from project files):

- `@nx/vite/plugin` — infers `vite:build`, `vite:dev`, `vite:typecheck`, `vite:build-deps`, `vite:watch-deps` for packages with a `vite.config.ts`
- `@nx/js/typescript` — infers `tsc:typecheck`, `tsc:build`, `tsc:build-deps`, `tsc:watch-deps` for packages with a `tsconfig.json`

**2. Global defaults** (`nx.json` → `targetDefaults`):

- Apply to all packages
- Define common configurations
- Examples: `prettier:format`, `cargo:format`, `eslint:lint`

**3. Package-specific** (`project.json` in each package):

- Override or extend global targets
- Wire `build` and `typecheck` to the appropriate tool-specific targets:
  - `build` → `dependsOn: ["vite:build"]` (Vite packages) or `["tsc:build"]` (TSC-only packages)
  - `typecheck` → `dependsOn: ["tsc:typecheck"]`
- Examples: `build`, `dev`, `test`

### Running Tasks

#### Single package

```bash
# Run a target for one package
pnpm nx <target> <package-name>

# Or with explicit run
pnpm nx run <package-name>:<target>

# With configuration
pnpm nx <target> <package-name> --configuration <config>
pnpm nx run <package-name>:<target>:<config>
```

#### Multiple packages

```bash
# Run target for all packages that have it
pnpm nx run-many -t <target>

# Run multiple targets
pnpm nx run-many -t <target1> <target2>

# Run for specific packages
pnpm nx run-many -t <target> -p <package1> <package2>

# With configuration
pnpm nx run-many -t <target> --configuration <config>
```

#### Examples

```bash
# Format all TypeScript packages
pnpm nx run-many -t prettier:format -p client-web ui codegen

# Lint and format Rust packages
pnpm nx run-many -t cargo:format cargo:lint -p client db service

# Type check all TS packages
pnpm nx run-many -t typecheck

# Build in debug mode
pnpm nx cargo:build client --configuration debug

# Check formatting without modifying
pnpm nx run-many -t prettier:format --configuration check
```

### Target Configurations

Many targets support configurations:

**`prettier:format`**:

- Default: Format files
- `check`: Verify formatting without modifying

**`cargo:format`**:

- Default: Format files
- `check`: Verify formatting without modifying

**`eslint:lint`**:

- Default: Lint files
- `fix`: Auto-fix issues

**`cargo:lint`**:

- Default: Run Clippy
- `fix`: Auto-fix issues

**`cargo:build`**:

- Default/`release`: Optimized build
- `debug`: Fast build with debug info

### Dependency Graph

NX understands dependencies between packages:

```bash
# View dependency graph
pnpm nx graph

# Run targets only for affected packages
pnpm nx affected -t <target>
```

Targets can depend on other targets:

```json
{
  "dependsOn": ["^build"]
}
```

The `^` means "run build for all dependencies first".

### Caching

NX caches task outputs for:

- Faster rebuilds
- Consistent CI/CD
- Reduced computation

**Cache configuration** is in `nx.json`:

```json
{
  "targetDefaults": {
    "build": {
      "cache": true
    }
  }
}
```

Clear cache:

```bash
pnpm nx reset
```

## Workspace Synchronization

### NX Sync

Keep the NX workspace in sync:

```bash
pnpm nx sync
```

**Run before**:

- Committing changes
- Running CI/CD
- After pulling updates

**What it does**:

- Syncs dependencies
- Updates target configurations
- Ensures graph is accurate

### TypeScript Project References

TypeScript uses project references (`tsconfig.json`):

```json
{
  "references": [
    { "path": "./packages/client-web" },
    { "path": "./packages/ui" }
  ]
}
```

**Benefits**:

- Faster builds (only rebuild changed projects)
- Better IDE performance
- Enforces dependency boundaries

## Cross-Package Development

### TypeScript to TypeScript

Import workspace packages:

```typescript
import { Button } from '@retrom/ui';
import { SomeType } from '@retrom/codegen';
```

**Development**:

- Changes in dependencies are reflected immediately
- TypeScript watches for changes
- No rebuild needed (dev mode)

### Rust to Rust

Reference workspace packages in `Cargo.toml`:

```toml
[dependencies]
retrom-db = { workspace = true }
retrom-service-common = { workspace = true }
```

**Development**:

- Cargo handles incremental compilation
- Changes rebuild dependents automatically
- Use `cargo check` for fast iteration

### TypeScript to Rust (via Codegen)

The `@retrom/codegen` package generates TypeScript types from protobuf:

1. Define `.proto` files in `packages/codegen/protos/`
2. Run `pnpm nx build codegen`
3. Import generated types in TypeScript packages

**Generated code locations**:

- TypeScript: `packages/codegen/dist/`
- Rust: `packages/codegen/src/gen/` (committed)

## Package Manager Commands

### PNPM

Install dependencies:

```bash
pnpm install
```

Add dependency to workspace package:

```bash
pnpm --filter <package-name> add <dependency>
```

Add workspace dependency:

```bash
pnpm --filter <package-name> add @retrom/ui@workspace:*
```

### Cargo

Build workspace:

```bash
cargo build
```

Build specific package:

```bash
cargo build -p <package-name>
```

Add dependency:

```bash
cargo add --package <package-name> <dependency>
```

## Development Workflows

### Starting Fresh

```bash
# Clone and setup
git clone <repo-url>
cd retrom

# Install dependencies
pnpm install

# Sync NX workspace
pnpm nx sync

# Build dependencies (if needed)
pnpm nx run-many -t build
```

### Daily Development

```bash
# Pull latest changes
git pull

# Install any new dependencies
pnpm install

# Sync workspace
pnpm nx sync

# Start development
pnpm nx dev <package-name>
```

### Pre-Commit Workflow

```bash
# Sync workspace
pnpm nx sync

# Format code
pnpm nx run-many -t prettier:format cargo:format

# Lint code
pnpm nx run-many -t eslint:lint cargo:lint

# Type check TypeScript
pnpm nx run-many -t typecheck

# Run tests
pnpm nx run-many -t cargo:test

# Commit changes
git add .
git commit -m "feat: description"
```

### Adding a New Package

#### TypeScript Package

1. Create package directory
2. Add `package.json` with workspace dependencies
3. Add `tsconfig.json` with project references
4. Add `project.json` for NX configuration
5. Update root `tsconfig.json` references
6. Run `pnpm install`

#### Rust Package

1. Create package with `cargo new`
2. Add to `[workspace.members]` in root `Cargo.toml`
3. Use workspace dependencies
4. Add `project.json` for NX integration (optional)
5. Run `cargo check`

## NX Cloud Integration

The repository is connected to NX Cloud (ID: `68671fe5462f6a349cd487bd`).

**Benefits**:

- Distributed task execution
- Remote caching
- CI/CD optimization

## MCP Integration

The repository uses `nx-mcp` for AI tooling integration:

- Configured in `mcp.json` at repository root
- Provides workspace context to AI agents
- Exposes NX targets and relationships

## Best Practices

### Workspace Hygiene

- ✅ Always run `pnpm nx sync` before committing
- ✅ Keep dependencies up to date
- ✅ Use workspace protocol for internal packages
- ✅ Run affected tasks in CI: `pnpm nx affected -t test lint`

### Task Organization

- ✅ Define common tasks in `nx.json` target defaults
- ✅ Override only when necessary in `project.json`
- ✅ Use consistent target naming across packages
- ✅ Leverage task dependencies with `dependsOn`

### Performance

- ✅ Use NX caching effectively
- ✅ Run only affected tasks when possible
- ✅ Clear cache if you see stale results
- ✅ Use parallel execution: `nx.json` → `"parallel": 5`

### Dependencies

- ✅ Use workspace dependencies for internal packages
- ✅ Keep external dependencies in workspace root when possible
- ✅ Version external dependencies consistently
- ✅ Use `catalog:` protocol in PNPM for shared versions
