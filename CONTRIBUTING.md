# CONTRIBUTING

Thank you for considering contributing to Retrom! This document provides a high-level overview of the project and instructions for getting started as a contributor.

## Setting up a development environment

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [PNPM](https://pnpm.io/installation) for JavaScript package management
- [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) (comes with Rust) for Rust package management
- [PostgreSQL](https://www.postgresql.org/download/) (required for the database package)
- [Perl](https://www.perl.org/) Required to compile some of the Rust packages. On Windows, Strawberry Perl is recommended.
- [Protobuf](https://protobuf.dev/) Required to compile some of the Rust packages.

### Initial setup

1. Clone the repository

   ```bash
   git clone https://github.com/JMBeresford/retrom.git
   cd retrom
   ```

2. Install JavaScript dependencies

   ```bash
   pnpm install
   ```

3. Run the project. This will spawn both the Rust backend service and the React web client.

   ```bash
   pnpm nx dev retrom-client-web
   ```

### Using GitHub Copilot CLI

This repository is configured to work with [GitHub Copilot CLI](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line) and includes MCP (Model Context Protocol) integration for enhanced AI assistance.

#### MCP Server Setup

The repository includes an `mcp.json` configuration file that enables the nx-mcp server. This allows AI tools to understand the NX workspace structure, projects, and available targets.

To use the MCP server:

1. Ensure you have the GitHub Copilot CLI installed and authenticated
2. The `mcp.json` file is already configured at the repository root
3. Copilot CLI will automatically discover the nx-mcp server when working in this repository

The nx-mcp server provides:

- Project graph and dependency information
- Available NX targets for each project
- Generator schemas and documentation
- Real-time task execution details

For more information about nx-mcp, see the [official documentation](https://nx.dev/docs/reference/nx-mcp).

### Troubleshooting

#### Build task for the retrom-service Rust app exits midway without error

If when using NX to start the `retrom-service` Rust app the compiling job exits midway without displaying an error message, navigate to the `packages\service` directory and run the `cargo build` command directly from there. The build command might display additional information on why the Rust build is failing.

## Monorepo structure

This project is organized as a monorepo containing both TypeScript and Rust packages. Most packages are part of both the PNPM workspace (TypeScript) and Cargo workspace (Rust).

### Main directories

- `packages/` - Core packages of the application

  - `client/` - Desktop application using Tauri
  - `client-web/` - Web client (React)
  - `service/` - Backend service (HTTP API and gRPC)
  - `db/` - Database management (Diesel.rs)
  - `codegen/` - Code generation for both Rust and TypeScript
  - `configs/` - Shared configuration files

- `plugins/` - Tauri plugins for the desktop client
  - Various plugins for functionality like launching games, Steam integration, etc.

For more detailed information about specific packages, please refer to their respective README.md files.

## Tooling

This project uses several tools to manage development workflows:

### Package management

- **PNPM** for JavaScript dependencies
- **Cargo** for Rust dependencies

### Monorepo management

- **NX** for orchestrating commands across packages

### Code quality

- **ESLint** for TypeScript linting
- **Clippy** for Rust linting
- **Prettier** for TypeScript formatting
- **rustfmt** for Rust formatting

### Common commands

- Sync the NX workspace:

  ```bash
  pnpm nx sync
  ```

- Build all packages:

  ```bash
  pnpm nx run-many -t build
  ```

- Run linters and type checking:

  ```bash
  pnpm nx run-many -t eslint:lint
  pnpm nx run-many -t clippy:lint
  pnpm nx run-many -t typecheck
  ```

- Format code:

  ```bash
  pnpm nx run-many -t prettier:format
  pnpm nx run-many -t rustfmt:format
  ```

- Check if formatting is correct:

  ```bash
  pnpm nx run-many -t prettier:format --configuration check
  pnpm nx run-many -t rustfmt:format --configuration check
  ```

- Run only the Rust backend service

  ```bash
  pnpm nx cargo:run retrom-service
  ```

For more details on available commands, see the [Tooling](#tooling) section in the repository documentation.

## Code standards

We follow strict code quality standards to maintain a consistent and maintainable codebase:

1. **Formatting**: All code must be formatted according to the project's style guides

   - TypeScript: Prettier
   - Rust: rustfmt

2. **Linting**: All code must pass linter checks

   - TypeScript: ESLint
   - Rust: Clippy

3. **Documentation**: Code changes should be accompanied by appropriate documentation updates
   - Update relevant README.md files when making significant changes
   - Add inline documentation for new functions and complex logic

### Pre-commit checklist

Before committing changes, ensure:

- The NX workspace is synced
- All code is formatted correctly
- All linter checks pass
- Documentation is updated if necessary
- Tests pass (if applicable)

## Pushing changes

1. **Create a branch**: Always work in a feature branch, not directly on main

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make small, focused commits**: Keep commits focused on a single logical change

3. **Write clear commit messages**: Follow the [conventional commits](https://www.conventionalcommits.org/) format

4. **Run pre-commit checks**:

   ```bash
   pnpm nx sync
   pnpm nx run-many -t prettier:format eslint:lint clippy:lint rustfmt:format typecheck buf:format
   ```

5. **Submit a pull request**: When your feature is complete, submit a pull request for review

## Getting help

If you need assistance or have questions about contributing, please:

- Check the package-specific README.md files
- Reach out to the project maintainers
  - join our [Discord server](https://discord.gg/tM7VgWXCdZ)
- Reference the documentation in the `docs/` directory

Thank you for contributing to Retrom!
