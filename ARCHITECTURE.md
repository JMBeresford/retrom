# Retrom Architecture

Retrom is organized around a central service that owns the canonical game library and a set of
client surfaces that present and act on that library. The repository is intentionally split so the
platform can support browser access and native desktop workflows without duplicating the source of
truth.

This document is intentionally a top-level, birds-eye view. It does not dive into the internal
structure of the service, web app, desktop app, or shared libraries. Those are better documented in
follow-up architecture docs for each major area.

## High-level shape

```text
                                         ┌─────────────────────────────────────────────────────────────────────┐
                                         │                               server                                │
                                         │                                                                     │
┌─────────────────────────────┐          │                                                                     │
│         web_client          │    ┌────▶│     ┌───────────────────────────┐                                   │
│                             │    │     │     │         services          │                                   │
│                             │    │     │     │                           │                                   │
│     ┌────────────────┐      │    │     │     │                           │                                   │
│     │frontend_assets │      │────┘     │     │     ┌────────────┐        │                                   │
│     │                │      │          │     │     │http_server │        │                                   │
│     └────────────────┘      │          │     │     │            │        │                                   │
│                             │          │     │     └────────────┘        │                                   │
└─────────────────────────────┘          │     │                           │                                   │
                                         │     │     ┌──────────────┐      │──────────▶┌────────────────────┐  │
                                         │     │     │grpc_services │      │    or     │sqlite_db (default) │  │
┌─────────────────────────────┐          │     │     │              │      │           │                    │  │
│       desktop_client        │          │     │     └──────────────┘      │           └────────────────────┘  │
│                             │          │     │     ┌──────────────┐      │                                   │
│     ┌────────────────┐      │          │     │     │webdav_server │      │                                   │
│     │frontend_assets │      │────┐     │     │     │              │      │                                   │
│     │                │      │    │     │     │     └──────────────┘      │                                   │
│     └────────────────┘      │    │     │     │                           │                                   │
│                             │    │     │     │                           │                                   │
│                             │    └────▶│     └───────────────────────────┘                                   │
└─────────────────────────────┘          │                   │                                                 │
                                         │                   │                                                 │
                                         └───────────────────│─────────────────────────────────────────────────┘
                                                            or
                                                             │
                                                             ▼
                                                  ┌───────────────────────┐
                                                  │postgres_db (optional) │
                                                  │                       │
                                                  └───────────────────────┘
```

## Core architectural idea

Retrom separates three concerns:

- The server owns the authoritative library state and service behavior.
- Clients provide user experience and interaction patterns.
- The database and file system provide persistence and local runtime resources.

This keeps the platform flexible:

- the same library can be accessed through any number of browser or desktop clients
- library maintenance, scanning, metadata fetching, and install/update jobs can happen in one place
- client-specific concerns such as local launch configuration and desktop integration remain close
  to the client.

## Server-side responsibility

The service layer is the center of the system. In this repo, the service-related packages are
grouped under `packages/service*`, `packages/rest-service` and `packages/webdav-service` and cover
the parts that are most naturally centralized:

- library ownership and state
- scanning and indexing game collections
- metadata acquisition and enrichment
- background jobs and automation
- file management
- persistence and database access
- configuration and service setup
- API exposure for clients

In other words, the service is the source of truth for the game library, while clients are thin-ish
interfaces to that truth and to user actions.

## Client-side responsibility

Client packages are responsible for the user-facing experience and platform-specific behavior. The
repo clearly separates the client packages from the service packages:

- `packages/client-web-next` represents browser-based access to the library
- `packages/client` and related desktop-facing packages (plugins) provide the native desktop
  experience
- `packages/ui-next` provides shared presentation primitives and reusable client UI patterns

The desktop client can be thought of as a native wrapper around the client experience, while the web
client provides browser access to the same underlying library and workflows. Both depend on the
centralized service rather than owning their own independent game library state.

## Shared and supporting infrastructure

A few package groups are not part of the core service-client split, but support both sides:

- `packages/db` for data persistence and access patterns
- `packages/configs` and related config packages for shared platform conventions
- `packages/codegen` for generated APIs and contracts
- `packages/telemetry` for observability

These shared layers reduce duplication and keep the client and server from running apart in data
contracts and development conventions.

## Typical runtime flow

A normal Retrom workflow looks like this:

1. A client connects to the central Retrom service.
2. The service resolves the current library state, metadata, and configuration from its backing data
   stores.
3. The user browses, edits, installs, or launches items through the client UI.
4. The service executes the command or job, updates canonical state, and exposes the result back to
   the client.
5. Desktop and web clients render the updated state without separately maintaining their own library
   database.

## Scope boundaries

This document intentionally stops at the system boundary. It is not a deep dive into:

- the internal service package layout
- the web client application architecture
- the desktop client runtime model
- the database or metadata subsystem internals
- the UI component architecture

Those topics can and should each grow into their own architecture documents as the project matures.
