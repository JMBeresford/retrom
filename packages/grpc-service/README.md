# Retrom gRPC Service

The Retrom gRPC Service package provides the core gRPC API implementation for the Retrom video game library management system. It defines a set of specialized service handlers that handle requests from clients through Protocol Buffers and gRPC.

> [!TIP]
> Check out the [`retrom-service`](../service/README.md) package for details on setting
> up the development environment, running the service, and contributing.

## Overview

This package implements several gRPC services that handle different aspects of the Retrom application:

- **Library Service**: Managed by the separate [`retrom-library-service`](../library-service/README.md) crate
- **Game Service**: Handles game metadata, files, and operations
- **Platform Service**: Provides platform information and management
- **Metadata Service**: Interfaces with external metadata providers
- **Client Service**: Manages client registrations and interactions
- **Server Service**: Provides server information and configuration
- **Emulator Service**: Manages emulator configurations
- **File Explorer Service**: Provides filesystem browsing capabilities
- **Job Service**: Manages background jobs and tasks
- **Saves Service**: Handles game save files and states

## Architecture

The package follows a modular architecture where each service is implemented as a separate handler struct that implements the corresponding gRPC service trait. The main components include:

- **Service Handlers**: Implement the gRPC service interfaces defined in Protocol Buffers
- **Database Integration**: Uses Diesel ORM for PostgreSQL database access
- **Connection Pooling**: Maintains separate connection pools for services with different usage patterns
- **Media Cache**: Implements caching for game and platform media assets
- **Job Management**: Provides background processing capabilities (via `retrom-library-service`)
- **Content Resolution**: Resolves game content, platforms, and metadata (via `retrom-library-service`)
