# Tooling Instructions

## NX Task Runner

NX is the primary tool for running tasks across the monorepo.

### Command Syntax

```bash
# Single package
pnpm nx <target> <package-name>
pnpm nx run <package-name>:<target>
pnpm nx run <package-name>:<target>:<configuration>

# Multiple packages
pnpm nx run-many -t <target1> <target2>
pnpm nx run-many -t <target> -p <package1> <package2>
pnpm nx run-many -t <target> --configuration <config>

# Affected packages only
pnpm nx affected -t <target>
```

### Available Targets

#### Formatting

**`prettier:format`** - Format TypeScript/JavaScript/JSON/Markdown

```bash
# Format all TS packages
pnpm nx run-many -t prettier:format

# Format specific packages
pnpm nx run-many -t prettier:format -p client-web ui

# Check only (don't modify)
pnpm nx run-many -t prettier:format --configuration check
```

**`cargo:format`** - Format Rust code

```bash
# Format all Rust packages
pnpm nx run-many -t cargo:format

# Check only
pnpm nx run-many -t cargo:format --configuration check
```

**`buf:format`** - Format protobuf files (codegen package)

```bash
# Format protobuf
pnpm nx buf:format codegen

# Check only
pnpm nx buf:format codegen --configuration check
```

**`markdownlint:lint`** - Lint markdown files (root level)

```bash
# Fix markdown issues
pnpm nx markdownlint:lint

# Check only
pnpm nx markdownlint:lint --configuration check
```

#### Linting

**`eslint:lint`** - Lint TypeScript code

```bash
# Lint all TS packages
pnpm nx run-many -t eslint:lint

# Lint specific packages
pnpm nx run-many -t eslint:lint -p client-web ui

# Auto-fix issues
pnpm nx run-many -t eslint:lint --configuration fix
```

**`cargo:lint`** - Run Clippy on Rust code

```bash
# Lint all Rust packages
pnpm nx run-many -t cargo:lint

# Auto-fix issues
pnpm nx run-many -t cargo:lint --configuration fix
```

#### Type Checking

**`typecheck`** - Type check TypeScript code

```bash
# Type check all packages
pnpm nx run-many -t typecheck

# Type check specific package
pnpm nx typecheck client-web
```

Internally, `typecheck` depends on `tsc:typecheck`, which is auto-inferred by the
`@nx/js/typescript` plugin.

#### Building

**`build`** - Build packages

```bash
# Build all packages
pnpm nx run-many -t build

# Build specific package
pnpm nx build client-web
```

Internally, `build` depends on `typecheck` and then delegates to a tool-specific target
(`vite:build` for Vite packages, `tsc:build` for TSC-only packages). These granular
targets are auto-inferred by the `@nx/vite/plugin` and `@nx/js/typescript` NX plugins.

**`cargo:build`** - Build Rust packages

```bash
# Build all Rust packages (release mode)
pnpm nx run-many -t cargo:build

# Debug build
pnpm nx cargo:build client --configuration debug

# Release build (explicit)
pnpm nx cargo:build client --configuration release
```

#### Testing

**`cargo:test`** - Run Rust tests

```bash
# Test all Rust packages
pnpm nx run-many -t cargo:test

# Test specific package
pnpm nx cargo:test service-common

# Pass arguments to cargo
pnpm nx cargo:test service-common -- --nocapture

# Run specific test
pnpm nx cargo:test service-common -- test_name
```

**`test`** - Run TypeScript tests (when implemented)

```bash
# Test all TS packages
pnpm nx run-many -t test

# Test specific package
pnpm nx test client-web
```

#### Development

**`dev`** - Start development server

```bash
# Start web dev server
pnpm nx dev client-web

# Run Rust binary in dev mode
pnpm nx dev client
```

**`cargo:run`** - Run Rust binary

```bash
# Run service
pnpm nx cargo:run service
```

### Workspace Sync

**Critical**: Always sync before committing

```bash
pnpm nx sync
```

**What it does**:

- Syncs TypeScript project references
- Updates NX cache
- Ensures dependencies are correct

**When to run**:

- After pulling changes
- Before committing
- After adding/removing packages
- After modifying dependencies

### Passing Arguments

Pass arguments through to underlying tools with `--`:

```bash
# Pass to cargo
pnpm nx cargo:test db -- --nocapture

# Pass to cargo with features
pnpm nx cargo:build service -- --features embedded-db

# Pass to Vite
pnpm nx build client-web -- --mode production
```

### Affected Commands

Run tasks only for affected packages:

```bash
# Affected by changes since main branch
pnpm nx affected -t test lint

# Affected by specific commits
pnpm nx affected -t build --base=HEAD~1 --head=HEAD

# See what would run
pnpm nx affected:graph
```

### Cache Management

NX caches task outputs for performance.

```bash
# Clear cache
pnpm nx reset

# View cache directory
ls -la .nx/cache/
```

**When to clear cache**:

- Seeing stale build outputs
- After major dependency updates
- When troubleshooting issues

### Dependency Graph

Visualize package relationships:

```bash
# Open interactive graph
pnpm nx graph

# Show affected graph
pnpm nx affected:graph

# Generate static graph
pnpm nx graph --file=graph.html
```

## Formatters

### Prettier

**Configuration**: `.prettierrc.json` at repository root

**Ignore file**: `.prettierignore`

**Manual usage**:

```bash
# Format files
pnpm prettier --write <file-or-pattern>

# Check formatting
pnpm prettier --check <file-or-pattern>
```

**Via NX** (recommended):

```bash
pnpm nx run-many -t prettier:format
pnpm nx run-many -t prettier:format --configuration check
```

### Rustfmt

**Configuration**: Default Rust 2021 style

**Manual usage**:

```bash
# Format workspace
cargo fmt

# Check formatting
cargo fmt -- --check
```

**Via NX** (recommended):

```bash
pnpm nx run-many -t cargo:format
pnpm nx run-many -t cargo:format --configuration check
```

### Buf

For protobuf files in the codegen package.

**Configuration**: `buf.yaml` and `buf.gen.yaml` in `packages/codegen/`

**Manual usage**:

```bash
cd packages/codegen
pnpm buf format --write
pnpm buf format --diff --exit-code  # check only
```

**Via NX** (recommended):

```bash
pnpm nx buf:format codegen
pnpm nx buf:format codegen --configuration check
```

## Linters

### ESLint

**Configuration**:

- Base: `packages/configs/eslint/base.config.js`
- Per-package: `eslint.config.js` in each TS package

**Rules**:

- TypeScript ESLint recommended type-checked rules
- Custom rules for unused vars, namespaces, etc.

**Manual usage**:

```bash
# Lint files
pnpm eslint <file-or-pattern>

# Fix issues
pnpm eslint --fix <file-or-pattern>
```

**Via NX** (recommended):

```bash
pnpm nx run-many -t eslint:lint
pnpm nx run-many -t eslint:lint --configuration fix
```

### Clippy

**Configuration**: Default Clippy lints

**Manual usage**:

```bash
# Lint workspace
cargo clippy

# Lint with auto-fix
cargo clippy --fix
```

**Via NX** (recommended):

```bash
pnpm nx run-many -t cargo:lint
pnpm nx run-many -t cargo:lint --configuration fix
```

### Markdownlint

**Configuration**: `.markdownlint.json` at repository root

**Usage**:

```bash
# Lint and fix
pnpm nx markdownlint:lint

# Check only
pnpm nx markdownlint:lint --configuration check
```

## Package Managers

### PNPM Package Manager

**Version**: Managed by `packageManager` field in root `package.json`

**Common commands**:

```bash
# Install dependencies
pnpm install

# Add dependency to specific package
pnpm --filter <package-name> add <dependency>

# Add workspace dependency
pnpm --filter <package-name> add @retrom/ui@workspace:*

# Update dependencies
pnpm update

# Remove dependency
pnpm --filter <package-name> remove <dependency>
```

**Workspace protocol**:

```json
{
  "dependencies": {
    "@retrom/ui": "workspace:*"
  }
}
```

### Cargo

**Common commands**:

```bash
# Build workspace
cargo build

# Build package
cargo build -p <package-name>

# Check (fast compile check)
cargo check

# Test
cargo test

# Add dependency to workspace
cargo add <dependency> --workspace

# Add dependency to package
cargo add --package <package-name> <dependency>
```

**Workspace dependencies**:

```toml
[dependencies]
dependency = { workspace = true }
```

## Build Tools

### Vite

Used by TypeScript packages for building and dev servers.

**Configuration**: `vite.config.ts` in each TS package

**Features**:

- Fast HMR (Hot Module Replacement)
- TypeScript support
- Plugin system
- Optimized production builds

**Run via NX**:

```bash
pnpm nx dev <package-name>     # Dev server (vite:dev)
pnpm nx build <package-name>   # Production build (delegates to vite:build)
```

### Cargo

Rust build system.

**Build profiles**:

- `dev` - Fast compilation, debug info
- `release` - Optimized, slower compilation

**Via NX**:

```bash
pnpm nx cargo:build <package> --configuration debug
pnpm nx cargo:build <package> --configuration release
```

## Pre-Commit Checklist

Run these commands before committing:

```bash
# 1. Sync workspace
pnpm nx sync

# 2. Format all code
pnpm nx run-many -t prettier:format cargo:format

# 3. Lint all code
pnpm nx run-many -t eslint:lint cargo:lint

# 4. Type check TypeScript
pnpm nx run-many -t typecheck

# 5. Run tests (for affected packages)
pnpm nx affected -t cargo:test
```

**One-liner** (format + lint):

```bash
pnpm nx sync && \
  pnpm nx run-many -t prettier:format cargo:format && \
  pnpm nx run-many -t eslint:lint cargo:lint && \
  pnpm nx run-many -t typecheck
```

## CI/CD Integration

### GitHub Actions

The repository has CI workflows in `.github/workflows/`.

**Common patterns**:

```yaml
# Install dependencies
- run: pnpm install

# Sync workspace
- run: pnpm nx sync

# Run affected tasks
- run: pnpm nx affected -t lint test build

# Run specific tasks
- run: pnpm nx run-many -t cargo:format --configuration check
```

### NX Cloud

Connected to NX Cloud for:

- Distributed task execution
- Remote caching
- CI optimization

**Configuration**: `nxCloudId` in `nx.json`

## Debugging

### NX Issues

```bash
# Verbose output
pnpm nx <command> --verbose

# Show what would run
pnpm nx <command> --dry-run

# Skip cache
pnpm nx <command> --skip-nx-cache

# Reset NX
pnpm nx reset
```

### TypeScript Issues

```bash
# Clear TypeScript cache
find . -name "*.tsbuildinfo" -delete

# Rebuild from scratch
pnpm nx reset
pnpm nx run-many -t build
```

### Rust Issues

```bash
# Clean build artifacts
cargo clean

# Update Cargo.lock
cargo update

# Check specific package
cargo check -p <package-name>
```

## Performance Tips

### Build Performance

- Use NX affected commands in CI
- Enable NX Cloud for remote caching
- Run parallel tasks: configured in `nx.json`
- Keep cache directory clean

### Development Performance

- Use `cargo check` instead of `cargo build` for fast iteration
- Use Vite's HMR for instant frontend updates
- Only run necessary tasks

### CI/CD Performance

- Use NX affected commands
- Leverage NX Cloud distributed task execution
- Cache node_modules and Cargo target directories
- Run linting, testing, and building in parallel
