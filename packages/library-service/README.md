# Retrom Library Service

The Retrom Library Service package provides the library management functionality for the Retrom video game library management system. It handles library scanning, content resolution, and library metadata operations through gRPC.

> [!TIP]
> Check out the [`retrom-service`](../service/README.md) package for details on setting
> up the development environment, running the service, and contributing.

## Overview

This package implements the Library gRPC service that handles:

- **Library Updates**: Scanning content directories and resolving platforms, games, and game files
- **Content Resolution**: Parsing library structures with custom directory layouts and storage types
- **Metadata Management**: Downloading and updating platform and game metadata from external providers
- **Library Cleanup**: Deleting libraries or removing entries for missing content

## Architecture

The package follows a modular architecture:

- **LibraryServiceHandlers**: Main gRPC service handler implementing the `LibraryService` trait
- **Content Resolver**: Resolves game content from filesystem using configurable library definitions
  - **ContentResolver**: Entry point for scanning content directories
  - **PlatformResolver**: Resolves platform directories and inserts them into the database
  - **GameResolver**: Resolves game directories/files and inserts them into the database
  - **Parser**: Parses custom library definition macros for flexible directory layouts
- **Handlers**: Individual request handlers for update, delete, and metadata operations

## Usage

The library service is typically used through the `library_service_server()` function which returns a configured `LibraryServiceServer`:

```rust
use retrom_library_service::library_service_server;

let library_service = library_service_server(
    db_pool,
    igdb_client,
    steam_web_api_client,
    job_manager,
    config_manager,
);

// Add to your gRPC router
routes_builder.add_service(library_service);
```

## Dependencies

This crate depends on several workspace packages:

- `retrom-codegen`: Protocol buffer definitions and generated types
- `retrom-db`: Database schema and connection utilities
- `retrom-service-common`: Shared service utilities including metadata providers
