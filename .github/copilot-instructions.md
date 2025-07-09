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
  - `client/`: rust workspace package, a tauri-based desktop application
    - `src/`: rust code for the desktop tauri application, which wraps the web client
  - `client-web/`: typescript workspace package for the web client, which is a React application
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
- `nx` is used for managing the monorepo and running commands (targets) across packages
  - `pnpm nx sync` syncs the NX workspace, ensuring dependencies and targets are up to date
  - `pnpm nx <target> <package>` or `pnpm nx run <package>:<target>` runs a target for a given package
  - `pnpm nx run-many -t <target1> <target2>` runs any amount of targets across all valid packages
  - `pnpm nx run-many -t <target1> <target2> -p <package1> <package2>` runs any amount of targets across specific packages
  - 'configurations' for a target can be executed in the following ways:
    - `pnpm nx run <package>:<target>:<configuration>` runs a specific configuration for a target in a package
    - `pnpm nx <target> <package> --configuration <configuration>` runs a specific configuration for a target in a package
    - `pnpm nx run-many -t <target1> <target2> -p <package1> <package2> --configuration <configuration>` runs a specific configuration for any number of valid targets in any number of valid packages
  - formatter targets are defined as `<formatter>:format` and linter targets are defined as `<linter>:lint`
    - e.g. `pnpm nx run-many -t eslint:lint -p client-web codegen` will run the `eslint:lint` target for the `client-web` and `codegen` packages
    - e.g. `pnpm nx run-many -t prettier:format -p client-web codegen` will run the `prettier:format` target for the `client-web` and `codegen` packages
  - formatter targets all have a `check` configuration that will check if the code is formatted correctly
    - e.g. `pnpm nx run-many -t prettier:format -p client-web codegen --configuration check` will check if the code is formatted correctly for the `client-web` and `codegen` packages

## Code Standards

### Required Before Each Commit

- Ensure the NX workspace is synced (refer to [tooling](#tooling))
- Ensure all code is formatted correctly (refer to [tooling](#tooling))
- Ensure all code is linted correctly (refer to [tooling](#tooling))
- Ensure all typescript code is type-checked
  - `pnpm nx run-many -t typecheck` will run type checking across all packages
- Ensure all documentation is up to date, if the changes alter
  something that is documented
