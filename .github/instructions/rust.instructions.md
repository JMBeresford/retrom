# Rust Development Instructions

## Technology Stack

This project uses Rust with the following key technologies:

- **Tauri 2.x** - Desktop application framework
- **Tokio** - Async runtime
- **Diesel** - ORM and query builder
- **diesel-async** - Async Diesel with deadpool connection pooling
- **Tonic** - gRPC framework
- **Axum** - HTTP web framework
- **OpenTelemetry** - Distributed tracing and observability

## Workspace Structure

The project uses a Cargo workspace defined in the root `Cargo.toml`:

### Workspace Members

**Packages:**

- `packages/client` - Tauri desktop application
- `packages/codegen` - Code generation and protobuf extensions
- `packages/db` - Database layer with Diesel
- `packages/service` - Combined service binary
- `packages/grpc-service` - gRPC service implementation
- `packages/rest-service` - REST API service implementation
- `packages/service-common` - Shared service utilities
- `packages/telemetry` - OpenTelemetry setup and instrumentation

**Plugins:**

- `plugins/retrom-plugin-config` - Config file management
- `plugins/retrom-plugin-installer` - Game installation management
- `plugins/retrom-plugin-launcher` - Game launching
- `plugins/retrom-plugin-service-client` - gRPC client for Tauri
- `plugins/retrom-plugin-standalone` - Embedded service/database
- `plugins/retrom-plugin-steam` - Steam integration

### Workspace Dependencies

Common dependencies are defined in `[workspace.dependencies]` and referenced as:

```toml
dependency-name = { workspace = true }
# or
dependency-name = { workspace = true, features = ["extra-feature"] }
```

Internal workspace packages are referenced as:

```toml
retrom-db = { workspace = true }
retrom-service-common = { workspace = true }
```

## Coding Standards

### Edition and Metadata

All packages should use:

- **Edition**: 2021
- **Version**: Inherited from workspace
- **Authors/License/Repository**: Inherited from workspace

### Error Handling

- Use `thiserror` for custom error types
- Use `Result<T, E>` for fallible operations
- Avoid unwrap/expect in library code; use proper error propagation
- For binaries, unwrap/expect are acceptable in initialization code

### Async Patterns

- Use `tokio` as the async runtime
- Prefer `async fn` over `impl Future`
- Use `tokio::spawn` for concurrent tasks
- Be mindful of blocking operations; use `tokio::task::spawn_blocking`

### Dependency Management

Common workspace dependencies:

- **Async**: `tokio`, `tokio-util`, `tokio-stream`, `futures`, `async-trait`
- **HTTP/gRPC**: `axum`, `tonic`, `tonic-web`, `tonic-reflection`, `hyper`, `tower`
- **Database**: `diesel`, `diesel-async`, `diesel_migrations`, `deadpool`
- **Serialization**: `serde`, `serde_json`, `prost`, `prost-types`
- **Tracing**: `tracing`, `tracing-subscriber`, `opentelemetry`, `opentelemetry-otlp`
- **Tauri**: `tauri`, `tauri-plugin-*`
- **Utilities**: `uuid`, `chrono`, `regex`, `thiserror`, `url`

## Code Formatting and Linting

### Rustfmt

- **Formatter**: Use `rustfmt` with default settings
- **Format all code before committing**
- Run via NX: `pnpm nx run-many -t cargo:format`
- Check formatting: `pnpm nx run-many -t cargo:format --configuration check`

### Clippy

- **Linter**: Use `clippy` for static analysis
- **Fix warnings before committing**
- Run via NX: `pnpm nx run-many -t cargo:lint`
- Auto-fix: `pnpm nx run-many -t cargo:lint --configuration fix`

## Testing Patterns

### Unit Tests

Use inline test modules with `#[cfg(test)]`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_something() {
        // test code
    }

    #[tokio::test]
    async fn test_async_something() {
        // async test code
    }
}
```

### Integration Tests

- Place integration tests in `tests/` directory at package root
- Each file in `tests/` is a separate test binary
- Use for testing public API and cross-module functionality

### Running Tests

- **All tests**: `pnpm nx run-many -t cargo:test`
- **Single package**: `pnpm nx cargo:test <package-name>`
- **With output**: Add `--` to pass through cargo args, e.g., `-- --nocapture`

## Package-Specific Patterns

### Tauri Applications (packages/client)

- Entry point in `src/main.rs`
- Tauri commands use `#[tauri::command]` attribute
- State management via Tauri's managed state
- Plugin system for extending functionality

### Service Packages

- **retrom-service**: Main service binary, combines gRPC and REST
- **retrom-grpc-service**: Tonic-based gRPC server implementation
- **retrom-rest-service**: Axum-based REST API
- **retrom-service-common**: Shared utilities, types, and logic

Common patterns:

- Use `tower` middleware for cross-cutting concerns
- OpenTelemetry instrumentation throughout
- Graceful shutdown handling with signal hooks

### Database Package (retrom-db)

- Uses Diesel for schema and queries
- Migrations in `migrations/` directory
- Connection pooling with `diesel-async` and `deadpool`
- Optional embedded PostgreSQL support (feature flag)

Diesel patterns:

- Schema definitions in `src/schema.rs` (generated)
- Models in appropriate module files
- Use QueryDsl for composable queries

### Plugins

Tauri plugins should:

- Use `tauri-plugin` builder API
- Export builder function
- Handle errors gracefully
- Document commands and events

## Build Configurations

### Release vs Debug

NX targets support configurations:

- **Release** (default): Optimized builds
- **Debug**: Fast compilation, debugging info

Run with: `pnpm nx cargo:build <package> --configuration debug`

### Feature Flags

Use Cargo features for conditional compilation:

```toml
[features]
default = ["feature1"]
feature1 = []
embedded-db = ["dep:postgres_embedded"]
```

## Common Dependencies Deep Dive

### Diesel and Database

```rust
use diesel::prelude::*;
use diesel_async::AsyncPgConnection;
use diesel_async::pooled_connection::deadpool::Pool;

// Connection pool is typically in app state
type DbPool = Pool<AsyncPgConnection>;
```

### Tonic and gRPC

```rust
use tonic::{Request, Response, Status};

// Generated from protobuf
pub struct MyService {
    db: DbPool,
}

#[tonic::async_trait]
impl my_service_server::MyService for MyService {
    async fn rpc_method(
        &self,
        request: Request<MyRequest>,
    ) -> Result<Response<MyResponse>, Status> {
        // implementation
    }
}
```

### Axum and REST

```rust
use axum::{
    Router,
    routing::get,
    extract::State,
    Json,
};

async fn handler(
    State(state): State<AppState>,
) -> Json<ResponseType> {
    // implementation
}

let app = Router::new()
    .route("/path", get(handler))
    .with_state(state);
```

### OpenTelemetry Tracing

```rust
use tracing::{info, warn, error, instrument};

#[instrument(skip(sensitive_param))]
async fn traced_function(id: u64, sensitive_param: String) -> Result<()> {
    info!("Processing request");
    // function body
    Ok(())
}
```

## Pre-Commit Checklist

Before committing Rust changes:

1. **Format code**: `pnpm nx run-many -t cargo:format`
2. **Lint code**: `pnpm nx run-many -t cargo:lint`
3. **Run tests**: `pnpm nx run-many -t cargo:test` (for affected packages)
4. **Sync NX workspace**: `pnpm nx sync`

## Best Practices

### Code Organization

- One module per file for clarity
- Use `mod.rs` for module entry points
- Re-export public API at appropriate levels
- Keep functions focused and small

### Performance

- Use `rayon` for CPU-bound parallel work
- Prefer `&str` over `String` when possible
- Use `Cow` for sometimes-borrowed data
- Profile before optimizing

### Safety

- **NEVER use `unsafe` code** - always find a safe alternative
- Use `#[must_use]` for critical return values
- Validate inputs at boundaries
- Use newtype pattern for type safety

### Documentation

- Document public APIs with `///`
- Use `//!` for module-level documentation
- Include examples in doc comments
- Run `cargo doc` to verify documentation builds

## NX Integration

Rust packages integrate with NX via `@monodon/rust` plugin:

- `cargo:build` - Build the package
- `cargo:run` - Run the binary (for binary crates)
- `cargo:test` - Run tests
- `cargo:lint` - Run Clippy
- `cargo:format` - Run rustfmt

Run commands with: `pnpm nx <target> <package-name>`

### Cargo-specific options

Pass through to cargo with `--`:

```bash
pnpm nx cargo:test db -- --nocapture
pnpm nx cargo:build service -- --features embedded-db
```
