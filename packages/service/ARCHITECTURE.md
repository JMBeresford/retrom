# Retrom Service Architecture

## Purpose

`retrom-service` is the orchestration layer for the Retrom backend. It does not implement most domain logic itself; instead, it boots the service runtime, creates the database connection, runs schema migrations, and composes the domain-specific routers and handlers from the workspace packages that implement the actual business features.

This package is the entry point that exposes a single runtime for:

- REST endpoints
- gRPC and gRPC-Web endpoints
- WebDAV access
- reverse-proxy routes
- startup configuration and diagnostics

## High-level system view

At runtime, the service package behaves like an application shell:

1. Initializes telemetry and startup configuration.
2. Resolves the bind port and opens the TCP listener.
3. Connects to the database and runs migrations.
4. Builds the HTTP router by merging application routers.
5. Starts the server and waits for graceful shutdown.

The architecture is intentionally modular: the top-level service package glues together smaller service crates rather than embedding all logic in one binary.

## Runtime startup flow

The startup path is centered around `get_server()` in `src/lib.rs`.

- `main()` in `src/main.rs` initializes tracing and loads configuration before booting the server.
- `get_server()` creates a database pool using `retrom_db::connect()` and retries on transient connection failures.
- `retrom_db::run_migrations(&db_pool)` executes schema upgrades before serving traffic.
- The server then builds the application router and starts `axum::serve()`.

This ensures the service only exposes traffic after the data layer is ready and schema state is valid.

## Composition model

The service package composes multiple routers into a single `axum::Router`:

- `config_router(None)`
- `clients_router(db_pool.clone())`
- `emulators_router(db_pool.clone())`
- `files_router(db_pool.clone())`
- `jobs_router()`
- `library_router(db_pool.clone())`
- `metadata_router(db_pool.clone())`
- `saves_router(db_pool.clone())`
- `tags_router(db_pool)`

The router is also merged with:

- `rest_service(db_pool.clone())` for REST APIs
- `reverse_proxy()` for backend request forwarding
- `webdav_service(None)` mounted under `/dav`
- `reflection_router(...)` for gRPC reflection and descriptor exposure

This creates a single service surface that speaks multiple protocols while keeping the implementation split across domain packages.

## Domain boundaries

Each domain-specific router belongs to a dedicated workspace crate that owns that feature area. The service package acts as the aggregator.

### Configuration

- `retrom-service-config`
- Handles server config reads and related endpoints
- Used during startup to determine telemetry and runtime settings

### Client APIs

- `retrom-service-clients`
- Owns client-facing routes and logic

### Emulators

- `retrom-service-emulators`
- Handles emulator definitions, configuration, and runtime integration

### Files

- `retrom-service-files`
- Manages file metadata, storage access, and file operations

### Jobs

- `retrom-service-jobs`
- Provides background task scheduling and job lifecycle endpoints

### Library

- `retrom-service-library`
- Owns game library operations and collection-related workflows

### Metadata

- `retrom-service-metadata`
- Integrates metadata providers and metadata retrieval flows

### Saves

- `retrom-service-saves`
- Manages save data and save-associated services

### Tags

- `retrom-service-tags`
- Handles metadata tagging and categorization

This split keeps each subsystem focused and makes the runtime easier to extend without creating a large monolithic service implementation.

## Database and persistence layer

The service package owns the database bootstrap process but does not define domain models itself. It relies on `retrom-db` for:

- connection handling
- migration execution
- connection pooling
- database-specific behavior

A single shared `db_pool` is passed to most routers, which lets the service keep a common persistence boundary while preserving domain ownership across sub-crates.

The database lifecycle in `get_server()` is important:

- the service selects a port and retries binding when occupied
- it retries database connection attempts with exponential backoff
- it exits early if migrations fail, preventing a partially initialized service from serving traffic

## Transport and protocol layer

The service exposes multiple protocol entry points through the same process:

### REST

`rest_service(db_pool.clone())` provides REST API handling via Axum. This layer is used for conventional HTTP clients and browser-based interaction.

### gRPC and gRPC-Web

`reflection_router(...)` registers the generated service descriptors and merges the gRPC service routers. `tonic_web::GrpcWebLayer::new()` is attached to the gRPC service stack so browser clients can use gRPC-Web transparently.

### WebDAV

`webdav_service(None)` is mounted under `/dav`, creating a file-access endpoint outside the main REST and gRPC flows.

### Reverse proxy

`reverse_proxy()` is merged into the root router, enabling proxy-based request forwarding for situations where the service sits in front of additional backend resources.

## Telemetry and observability

The service integrates with `retrom_telemetry` and uses gRPC tracing middleware provided by `tower_http::trace::TraceLayer`:

- `GrpcServerSpanHandler::new()` sets server span metadata
- request/response flow is traced through the gRPC pipeline
- traces and logs are initialized in `main()`

This keeps request instrumentation consistent across the composite service surface.

## Graceful shutdown and resilience

The runtime handles lifecycle concerns explicitly:

- startup retries for port binding and database connection
- exponential backoff on database startup failure
- graceful shutdown via `shutdown_signal()`
- `tokio::select!` handles either server termination or an OS shutdown signal
- the server logs a clean shutdown path before exiting

This reduces the chance of abrupt termination during restarts or deployments.

## Version and announcement checks

The service also checks for upstream version announcements from GitHub on startup using `reqwest::get()` against the Retrom release data URL. The check is non-fatal: failures to fetch or parse the payload are logged and ignored, but success triggers any matching version announcements for the current build.

## Key files in this package

- `src/main.rs` — binary entry point, tracing initialization, startup bootstrapping
- `src/lib.rs` — main service composition and runtime lifecycle
- `src/reverse_proxy.rs` — request forwarding logic
- `Cargo.toml` — package dependencies and workspace wiring
- `README.md` — package-level usage summary for developers

## Architectural summary

The `retrom-service` package is best understood as the runtime aggregator for the Retrom backend. It handles lifecycle, protocol composition, database initialization, and middleware integration while delegating domain logic to specialized workspace crates. The design favors modularity, cross-protocol integration, and safe startup sequencing over a monolithic implementation.
