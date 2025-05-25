This is a Typescript and Rust based monorepo for a game library management
application.

## Monorepo Structure

Most of the packages in the monorepo are both Cargo workspace
packages and PNPM workspace packages. The root of the monorepo
is also the root workspace for both Cargo and PNPM. Each workspace
package can contain it's own `eslint.config.js` for extending the
base Typescript linter configuration. Each package can also contain
additional information in their own `README.md` files.

- `docs/`: markdown documentation for the github wiki, user-facing documentation, is a git submodule
- `packages/`: Top level package directory for the workspace
  - `client/`: Top level client workspace package, a tauri-based desktop application
    - `src/`: rust code for the desktop tauri application, which wraps the web client
    - `web/`: typescript nested workspace package for the web client, which is a React application
  - `codegen/`: workspace package for code generation tools, outputs both Rust and Typescript code
    - `protos/`: the protobuf definitions used for the code generation
    - `src/`: rust code that extends the codegen with some extra functionality
    - `buf.gen.yaml`: configuration for the Buf code generation tool
    - `buf.yaml`: non-generation configuration for Buf
  - `configs/`: various shared configuration files for the monorepo
  - `db/`: database workspace package, contains the database schema and migrations, uses Diesel.rs
    - `migrations/`: directory for the database migrations (currently Postgresql only)
    - `src/`: rust code for the database package, provides connection pool types and other utilities
      - `embedded.rs`: opt-in embedded database support for standalone mode (no dedicated server)
  - `service/`: workspace package for the backend service, an HTTP API server and a gRPC server
    - `src/`: rust code for the service package, contains the main server code and handlers
- `plugins/`: Workspace packages specific to extending the tauri desktop client
  - `retrom-plugin-config/`: shared config file state management for the tauri desktop client
  - `retrom-plugin-installer/`: plugin that manages local installations of games
  - `retrom-plugin-launcher/`: plugin that manages launching games
  - `retrom-plugin-service-client/`: shared gRPC client for the tauri desktop client to
    communicate with the backend service
  - `retrom-plugin-standalone/`: plugin that runs and embedded service+database in the
    tauri desktop client for standalone mode
  - `retrom-plugin-steam/`: plugin that tracks and launches local Steam game installations

## Tooling

- `eslint` and `clippy` are used for linting the Typescript and Rust code respectively
  - rarely called directly, there are package scripts for running them
- `prettier` and `rustfmt` are used for formatting the Typescript and Rust code respectively
  - rarely called directly, there are package scripts for running them
- `turborepo` is used for managing the monorepo and running commands across packages
  - `pnpm turbo run <command>` or `pnpm turbo <command>` runs a command across all supported packages
  - `pnpm turbo run --filter <package1> --filter <package2> <command>` runs a command across a
    subset of packages
  - `pnpm turbo lint` will lint the entire monorepo (calls `eslint` and `clippy`)
  - `pnpm turbo format` will format the entire monorepo (calls `prettier` and `rustfmt`)
  - `pnpm turbo build` will build the web application
  - `pnpm turbo build:desktop` will build the desktop application, which wraps the web application

Sometimes the rust-based tooling can take a while to run, so you can directly run the Typescript
linter for a package by sidestepping `turbo` entriely. For example,
`pnpm --filter @retrom/client-web lint` will run eslint for the web client package. This ensures
that the correct configuration is used as well. Do not execute `eslint`, `prettier`,
`cargo clippy` or `rustfmt` directly.

## Code Standards

### Required Before Each Commit

- Ensure all code is formatted correctly (refer to [tooling](#tooling))
- Ensure all code is linted correctly (refer to [tooling](#tooling))
- Ensure all documentation is up to date, if the changes alter
  something that is documented
