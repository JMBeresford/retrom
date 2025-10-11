# Retrom Service

<!--toc:start-->

- [Retrom Service](#retrom-service)
  - [Overview](#overview)
  - [Key Features](#key-features)
  - [Architecture](#architecture)
  - [Technical Implementation](#technical-implementation)
  - [Dependencies](#dependencies)
  - [Configuration](#configuration)
  - [Running the Service](#running-the-service)
  - [Development](#development)
  - [Features](#features)
  - [Notes](#notes)
  <!--toc:end-->

The Retrom Service is the core backend component of the Retrom video game
library management system. It provides both REST and gRPC APIs for client
applications to interact with the game library, metadata, and other functionality.

## Overview

This package implements a combined HTTP server that handles both REST API and
gRPC-Web requests. It's built with Rust and uses several key technologies:

- **Database**: PostgreSQL with Diesel ORM for data persistence
- **API**: Dual REST and gRPC-Web interfaces through a single server
- **Telemetry**: OpenTelemetry integration for monitoring and tracing
- **Concurrency**: Tokio for async runtime and task management

## Key Features

- **Unified API Server**: Routes requests to either REST or gRPC services based on request headers
- **Database Migrations**: Automatically runs migrations on startup
- **Embedded Database Mode**: Optional embedded PostgreSQL for standalone operation (via feature flag)
- **Connection Pooling**: Efficient database connection management with separate pools for different services
- **Configurable**: Uses JSON configuration files with defaults that can be overridden
- **Telemetry**: Built-in support for OpenTelemetry tracing
- **Version Announcements**: Checks for important announcements from the repository
- **Graceful Shutdown**: Properly handles termination signals (SIGTERM, SIGINT, SIGQUIT)
- **Automatic Port Selection**: Finds an available port if the configured port is already in use

## Architecture

The service acts as the central hub that coordinates several specialized sub-services:

- **Library Service**: Manages game libraries and collections
- **Game Service**: Handles game metadata and details
- **Platform Service**: Provides information about gaming platforms
- **Metadata Service**: Interfaces with external metadata providers (IGDB, Steam)
- **Emulator Service**: Manages emulator configurations and integration
- **File Explorer Service**: Handles browsing of the filesystem
- **Job Service**: Manages background tasks and processes
- **Client Service**: Handles client-specific functionality
- **Server Service**: Provides server information and management
- **Saves Service**: Manages game save files

Each service is implemented as a gRPC service with its own handler struct and set of operations.

## Technical Implementation

- **HTTP Routing**: The service uses a single HTTP server that routes requests to either the gRPC or REST services based on content-type headers
- **gRPC-Web Support**: Built-in support for gRPC-Web for browser compatibility
- **CORS Configuration**: Pre-configured CORS headers for cross-origin requests
- **Database Connection Retry**: Uses exponential backoff to retry database connections on startup
- **Database Connection Pooling**: Separate connection pools for library service (which has high DB usage) and other services
- **Configuration Management**: Uses ServerConfigManager for configuration loading and access
- **Media Caching**: Includes a media cache for efficient handling of game media assets

## Dependencies

The service relies on several workspace packages:

- [`retrom-db`](../db/README.md): Database access layer and migrations
- [`retrom-rest-service`](../rest-service/README.md): REST API implementation
- [`retrom-grpc-service`](../grpc-service/README.md): gRPC API implementation
- [`retrom-service-common`](../service-common/README.md): Shared utilities and common functionality
- [`retrom-telemetry`](../telemetry/README.md): Telemetry and monitoring infrastructure
- [`retrom-codegen`](../codegen/README.md): Generated code from Protocol Buffers

Key external dependencies include:

- **Tokio**: Async runtime
- **Hyper**: HTTP server framework
- **Diesel**: SQL ORM
- **Axum**: REST API framework
- **Tonic**: gRPC framework
- **OpenTelemetry**: Telemetry integration

## Configuration

> [!TIP]
> Checkout out the [`service-common`](../service-common/README.md) package for detailed configuration options.

The service can be configured through JSON configuration files. Default settings include:

- Default port: 5101
- Default database URL: "postgres://postgres:postgres@localhost/retrom"

Configuration options include:

- **Connection**: Port and database URL settings
- **Telemetry**: OpenTelemetry configuration options
- **API Keys**: Configuration for external services like IGDB and Steam

## Running the Service

The service can be run using Cargo:

```bash
# With NX (recommended in monorepo)
pnpm nx cargo:run retrom-service

# With default settings, sidestepping NX
cargo run --package retrom-service

# With embedded database, sidestepping NX
cargo run --package retrom-service --features embedded_db
```

## Development

This package includes several NX targets for development:

- `cargo:lint`: Runs linting via Clippy
- `cargo:format`: Formats code via rustfmt
- `cargo:build`: Builds the project
- `cargo:test`: Runs tests
- `cargo:run`: Runs the service

## Features

- `embedded_db`: Enables the embedded PostgreSQL database support for standalone operation

## Notes

- The service automatically attempts to find an available port if the configured port is in use
- When running in embedded database mode, the service automatically starts a PostgreSQL instance
- The service checks for important announcements from the repository on startup
- In development mode, the service automatically loads environment variables from `.env` file
