# Service Layer Refactor: Implementation Plan

<!--toc:start-->

- [Service Layer Refactor: Implementation Plan](#service-layer-refactor-implementation-plan)
  - [Overview](#overview)
    - [Goals](#goals)
    - [Guiding Principles](#guiding-principles)
    - [Scope](#scope)
  - [Current Architecture](#current-architecture)
    - [Package Structure](#package-structure)
    - [Service Inventory](#service-inventory)
    - [Known Limitations](#known-limitations)
  - [Target Architecture](#target-architecture)
    - [Package Structure](#package-structure-1)
    - [Service Inventory](#service-inventory-1)
  - [Phase 1: Data Layer Foundation](#phase-1-data-layer-foundation)
    - [1.1 New Database Tables](#11-new-database-tables)
    - [1.2 Modified Existing Tables](#12-modified-existing-tables)
    - [1.3 New Relational Mapping Tables](#13-new-relational-mapping-tables)
    - [1.4 Tables to Retire](#14-tables-to-retire)
    - [1.5 Proto Model Updates](#15-proto-model-updates)
    - [1.6 Diesel Schema and Model Updates](#16-diesel-schema-and-model-updates)
    - [1.7 Acceptance Criteria](#17-acceptance-criteria)
  - [Phase 2: Service Interface Redesign](#phase-2-service-interface-redesign)
    - [2.1 Config Service (Replaces ServerService)](#21-config-service-replaces-serverservice)
    - [2.2 Enhanced Library Service](#22-enhanced-library-service)
    - [2.3 Updated Metadata Service](#23-updated-metadata-service)
    - [2.4 Updated Emulator Service](#24-updated-emulator-service)
    - [2.5 Updated Client Service](#25-updated-client-service)
    - [2.6 Job Service (Dedicated gRPC Service Crate)](#26-job-service-dedicated-grpc-service-crate)
    - [2.7 Saves Service (Minimal Change)](#27-saves-service-minimal-change)
    - [2.8 Deprecated Services](#28-deprecated-services)
    - [2.9 Acceptance Criteria](#29-acceptance-criteria)
  - [Phase 3: Service Decomposition](#phase-3-service-decomposition)
    - [3.1 Create Per-Service Crates](#31-create-per-service-crates)
    - [3.2 Refactor retrom-db for sqlx + SQLite/PostgreSQL Support](#32-refactor-retrom-db-for-sqlx--sqlitepostgresql-support)
    - [3.3 MetadataProvider Registry in retrom-service-common](#33-metadataprovider-registry-in-retrom-service-common)
    - [3.4 Update Binary Wiring](#34-update-binary-wiring)
    - [3.5 Acceptance Criteria](#35-acceptance-criteria)
  - [Phase 4: Data Migration](#phase-4-data-migration)
    - [4.1 Seed Metadata Providers](#41-seed-metadata-providers)
    - [4.2 Normalize Metadata Arrays](#42-normalize-metadata-arrays)
    - [4.3 Normalize Emulator Platform Support](#43-normalize-emulator-platform-support)
    - [4.4 Migrate Library Model](#44-migrate-library-model)
    - [4.5 Migrate Game-Platform Relationships](#45-migrate-game-platform-relationships)
    - [4.6 Migrate Genre Tags](#46-migrate-genre-tags)
    - [4.7 Acceptance Criteria](#47-acceptance-criteria)
  - [Phase 5: Client Compatibility](#phase-5-client-compatibility)
    - [5.1 TypeScript Client Updates](#51-typescript-client-updates)
    - [5.2 Tauri Plugin Updates](#52-tauri-plugin-updates)
    - [5.3 Acceptance Criteria](#53-acceptance-criteria)
  - [Risk Analysis](#risk-analysis)
  - [Dependency Map](#dependency-map)
  - [Open Questions](#open-questions)

<!--toc:end-->

## Overview

This document describes the plan to refactor the Retrom service layer to align with the target
architecture described in the project's architecture specification. The refactor touches the data
model, protobuf service definitions, Rust service implementations, and TypeScript client code.

### Goals

- **Normalise the data model** — replace ad-hoc arrays (e.g. `video_urls`, `supported_platforms`)
  with proper relational tables.
- **Introduce a first-class Library model** — make libraries an explicit database entity rather
  than a derived concept from the server config's `content_directories` list.
- **Introduce a first-class MetadataProvider model** — decouple metadata from hardcoded
  IGDB/Steam coupling and make providers pluggable.
- **Introduce a flexible Tag system** — replace the IGDB-specific `game_genres` model with a
  general-purpose key/value tagging system for both games and platforms.
- **Consolidate service boundaries** — merge `GameService` and `PlatformService` into an
  expanded `LibraryService`; rename `ServerService` to `ConfigService` with expanded
  client-config persistence capability.
- **Decompose the service monolith** — extract each gRPC service domain into its own Cargo
  crate, each exporting an Axum `Router`. Introduce a dedicated `JobService` crate for
  tracking job progress over gRPC (not a shared in-process state object).
- **Replace Diesel with sqlx** — drop the Diesel ORM in favour of
  [sqlx](https://github.com/launchbadge/sqlx), removing the hard dependency on PostgreSQL.
  All SQL must use only generic, database-agnostic syntax so that SQLite is fully supported
  alongside PostgreSQL. A new `retrom-db` crate encapsulates all sqlx query logic and
  migration management.

### Guiding Principles

1. Each phase should leave the system in a releasable state.
2. Database migrations must be backward-safe where possible (add before remove).
3. Deprecated service RPCs are kept as pass-through stubs until all known clients are updated,
   then removed in a subsequent minor version. Proto definitions for deprecated services and
   messages **must** be marked with `option deprecated = true;` so that code-generation
   tools can surface warnings to consumers.
4. Rust protobuf code is generated at compile-time by the Prost crate — **do not commit
   generated Rust code** to the repository. TypeScript generated code lives in
   `packages/codegen/dist/` (gitignored) and is regenerated as part of the TypeScript build.
5. All new SQL must use only generic, portable syntax supported by both PostgreSQL and SQLite
   (no `SERIAL`, `TIMESTAMPTZ`, `JSONB`, `ARRAY`, `unnest`, or other database-specific
   features). Use `INTEGER PRIMARY KEY` for auto-increment columns and `TEXT` for JSON blobs.

### Scope

| In Scope | Out of Scope |
|---|---|
| `packages/db` — sqlx migrations and query layer | `packages/client-web` UI layer |
| `packages/codegen` — proto definitions | `packages/client` Tauri shell |
| `packages/grpc-service` and successor per-service crates | Docker/deployment configuration |
| `packages/rest-service` — REST endpoints | Authentication / multi-user support |
| `packages/service-common` — shared utilities | WebDAV service internals |
| `packages/service` — binary wiring | CI/CD pipeline changes |
| `plugins/retrom-plugin-service-client` — Tauri gRPC client | |

---

## Current Architecture

### Package Structure

```
packages/
├── service/          # Binary: routing (gRPC | REST | WebDAV), startup, shutdown
├── grpc-service/     # All gRPC service handlers (monolithic)
│   └── src/
│       ├── library/          # LibraryService
│       ├── games.rs          # GameService
│       ├── platforms.rs      # PlatformService
│       ├── metadata/         # MetadataService
│       ├── emulators/        # EmulatorService
│       ├── clients/          # ClientService
│       ├── server/           # ServerService
│       ├── file_explorer/    # FileExplorerService
│       ├── jobs/             # JobService + JobManager (lives here, not in common)
│       └── saves/            # SavesService (v1, v2)
├── rest-service/     # REST: file downloads, game routes, web app, public assets
├── webdav-service/   # WebDAV: serves entire data directory
├── service-common/   # Config, MediaCache, MetadataProviders (IGDB, Steam), RetromDirs
├── db/               # Diesel schema, migrations, connection pool types
├── codegen/          # Protobuf definitions + generated Rust/TypeScript
└── telemetry/        # OpenTelemetry setup
```

### Service Inventory

| Service | gRPC Package | Status |
|---|---|---|
| `LibraryService` | `retrom` | Active |
| `GameService` | `retrom` | Active |
| `PlatformService` | `retrom` | Active |
| `MetadataService` | `retrom` | Active |
| `EmulatorService` | `retrom` | Active |
| `ClientService` | `retrom` | Active |
| `ServerService` | `retrom` | Active |
| `JobService` | `retrom` | Active |
| `FileExplorerService` | `retrom` | Active |
| `SavesService` (v1) | `retrom.services.saves.v1` | Active |
| `EmulatorSavesService` (v2) | `retrom.services.saves.v2` | Active |

### Known Limitations

- **Monolithic gRPC package** — all handlers live in one Cargo crate, making it difficult to
  test or evolve individual domains independently.
- **Arrays as pseudo-relations** — `game_metadata.video_urls`, `game_metadata.screenshot_urls`,
  `game_metadata.artwork_urls`, and `emulators.supported_platforms` are all `Array<Text>` or
  `Array<Int4>` columns rather than proper foreign-key relations.
- **Hardcoded metadata providers** — `IGDBProvider` and `SteamWebApiProvider` are constructed
  directly in `grpc_service()` with no abstraction for adding new providers.
- **Library is config-only** — libraries exist only in `ServerConfig.content_directories`; there
  is no `libraries` table, so library-level operations (name, scanning policy) cannot be
  persisted per-library.
- **Genre system is IGDB-specific** — `game_genres` and `game_genre_maps` are tightly coupled
  to IGDB data structures. There is no equivalent for platforms, and no way to add user-defined
  tags.
- **`JobManager` belongs to `grpc-service`** — any future service package that needs to spawn
  background jobs must take a dependency on the full gRPC crate.
- **`LocalEmulatorConfig` is missing fields** — `default_profile_id`, `bios_directory`,
  `extra_files_directory` are not yet present.
- **`GameService` / `PlatformService` / `ServerService` naming** — the planned architecture
  consolidates these under `LibraryService` and `ConfigService` respectively.

---

## Target Architecture

### Package Structure

The package structure is significantly reworked. The monolithic `retrom-grpc-service` crate is
decomposed into per-domain service crates. Each service crate owns its gRPC handler
implementation and exports a Tonic service wrapped as an Axum `Router` (via `tonic-web` /
`axum`). The binary in `packages/service` assembles those routers. The `packages/db` crate is
rewritten around sqlx and supports both PostgreSQL and SQLite.

**Per-service crate options for the Router export:**

- **Axum `Router`** (recommended) — each crate calls `tonic_web::enable(ServiceServer::new(...))`
  and wraps it with `axum::Router::new().route_service(...)`. The binary merges routers with
  `.merge()`. This is already how the Axum + tonic-web integration works in the codebase.
- **Tower `Service`** — alternative if the team prefers a lower-level primitive; requires manual
  routing in the binary.
- **Tonic `Router`** — simplest to express gRPC concerns, but requires the binary to aggregate
  them with `tonic::transport::Server::builder().add_service(...)`. Less suitable for mixing
  gRPC and REST on the same port.

**Recommendation:** Axum `Router` per crate, merged in the binary via `.merge()`. This is
consistent with the existing rest-service integration and enables future HTTP middleware to be
applied at the binary level without touching individual service crates.

```
packages/
├── service/              # Binary: assembles all service Routers, startup, shutdown
├── service-library/      # retrom-service-library — LibraryService handler + Router
├── service-metadata/     # retrom-service-metadata — MetadataService handler + Router
├── service-emulators/    # retrom-service-emulators — EmulatorService handler + Router
├── service-clients/      # retrom-service-clients — ClientService handler + Router
├── service-config/       # retrom-service-config — ConfigService handler + Router
├── service-jobs/         # retrom-service-jobs — JobService handler + Router + JobManager
├── service-saves/        # retrom-service-saves — SavesService (v1 + v2) handler + Router
├── grpc-service/         # DEPRECATED shell kept only during the transition period
├── rest-service/         # (unchanged)
├── webdav-service/       # (unchanged)
├── service-common/       # Shared utilities: config, media cache, metadata providers
├── db/                   # sqlx-based query layer + migrations (Postgres + SQLite)
├── codegen/              # Protobuf definitions only (no committed generated Rust code)
└── telemetry/            # (unchanged)
```

> The `grpc-service` shell package is kept during the transition to allow incremental extraction.
> Once all domain crates are stable, it can be removed.

### Service Inventory

| Service | gRPC Package | Replaces / Notes |
|---|---|---|
| `ConfigService` | `retrom.services.config.v1` | Replaces `ServerService`; adds client config persistence |
| `LibraryService` | `retrom.services.library.v1` | Expanded; absorbs `GameService` and `PlatformService` |
| `MetadataService` | `retrom.services.metadata.v1` | Updated; provider-aware |
| `EmulatorService` | `retrom.services.emulators.v1` | Updated; mapping-table based |
| `ClientService` | `retrom.services.clients.v1` | Expanded with client config |
| `JobService` | `retrom.services.jobs.v1` | Dedicated service crate; exposes job progress over gRPC |
| `SavesService` (v1) | `retrom.services.saves.v1` | Unchanged |
| `EmulatorSavesService` (v2) | `retrom.services.saves.v2` | Unchanged |
| ~~`GameService`~~ | ~~`retrom`~~ | Deprecated (`option deprecated = true`) — RPCs moved to `LibraryService` |
| ~~`PlatformService`~~ | ~~`retrom`~~ | Deprecated (`option deprecated = true`) — RPCs moved to `LibraryService` |
| ~~`FileExplorerService`~~ | ~~`retrom`~~ | Deprecated (`option deprecated = true`) — evaluate separate treatment |

---

## Phase 1: Data Layer Foundation

> **Prerequisite for all other phases.** Start here and ensure all migrations are applied and
> passing before moving to Phase 2.

### 1.1 New Database Tables

Each item below requires:

1. A Diesel migration under `packages/db/migrations/`
2. An update to `packages/db/src/schema.rs`
3. A new Rust model struct (typically in a new file under `packages/db/src/` or within the
   relevant service handler module)

#### `libraries`

Represents a first-class library entity that was previously implicit in `ServerConfig`.

```sql
CREATE TABLE libraries (
  id                   INTEGER PRIMARY KEY,
  name                 TEXT NOT NULL,
  structure_definition TEXT NOT NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> `structure_definition` stores the scanning policy for this library (maps to the existing
> `StorageType` enum + `CustomLibraryDefinition` message; encoded as a JSON text string so that
> the same schema works on both PostgreSQL and SQLite).

#### `root_directories`

Represents a filesystem path that can be assigned to a library, platform, or game via a
mapping table. Storing root directories independently (without a direct FK to any one entity)
allows a single directory to be shared across multiple entities or reassigned without moving
data.

```sql
CREATE TABLE root_directories (
  id         INTEGER PRIMARY KEY,
  path       TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> Relationships to libraries, platforms, and games are managed through the
> `library_root_directory_maps`, `platform_root_directory_maps`, and
> `game_root_directory_maps` mapping tables (see [1.3](#13-new-relational-mapping-tables)).

#### `metadata_providers`

Makes IGDB, Steam, and future providers first-class entities.

```sql
CREATE TABLE metadata_providers (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Seed values (inserted in a migration, not at application startup):

| id | name |
|----|------|
| 1 | IGDB |
| 2 | Steam |

#### `tags`

General-purpose key/value tagging for games and platforms. Replaces the IGDB-specific
`game_genres` / `game_genre_maps` system.

```sql
CREATE TABLE tags (
  id         INTEGER PRIMARY KEY,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (key, value)
);
```

#### `video_metadata`

Normalises `game_metadata.video_urls` into a proper relation.

```sql
CREATE TABLE video_metadata (
  id               INTEGER PRIMARY KEY,
  game_metadata_id INTEGER NOT NULL REFERENCES game_metadata(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> **Note:** this requires `game_metadata` to gain its own surrogate `id` column first (see
> [1.2](#12-modified-existing-tables)).

#### `screenshot_metadata`

Normalises `game_metadata.screenshot_urls`.

```sql
CREATE TABLE screenshot_metadata (
  id               INTEGER PRIMARY KEY,
  game_metadata_id INTEGER NOT NULL REFERENCES game_metadata(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `artwork_metadata`

Normalises `game_metadata.artwork_urls`.

```sql
CREATE TABLE artwork_metadata (
  id               INTEGER PRIMARY KEY,
  game_metadata_id INTEGER NOT NULL REFERENCES game_metadata(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 1.2 Modified Existing Tables

Modifications to existing tables must be done in separate migrations. Adding new columns as
nullable is safe on both PostgreSQL and SQLite. Note that SQLite has limited `ALTER TABLE`
support (only `ADD COLUMN` and `RENAME COLUMN` are broadly available); dropping columns or
changing column types must be done via the create-new-table / copy / drop-old / rename pattern
where needed. Since we are moving to sqlx, the migration runner (sqlx-cli or the application's
`sqlx::migrate!` macro) handles both databases from the same migration files.

#### `game_metadata`

1. **Add surrogate `id` column** (required before `video_metadata`, `screenshot_metadata`,
   `artwork_metadata` can reference it). Backfill via a migration helper (Rust code in the
   sqlx migration script, not a raw SQL sequence expression):

   ```sql
   ALTER TABLE game_metadata ADD COLUMN id INTEGER;
   ```

2. **Add `provider_id` FK** (nullable initially; backfill to IGDB provider id where
   `igdb_id IS NOT NULL`, Steam where applicable, then enforce `NOT NULL` in a follow-up
   migration once backfill is confirmed complete):

   ```sql
   ALTER TABLE game_metadata
     ADD COLUMN provider_id INTEGER REFERENCES metadata_providers(id);
   ```

3. **Rename URL columns** (supported by PostgreSQL 10+ and SQLite 3.25+):

   ```sql
   ALTER TABLE game_metadata RENAME COLUMN cover_url      TO cover_image_url;
   ALTER TABLE game_metadata RENAME COLUMN background_url TO background_image_url;
   ```

4. **Add `logo_url`** (currently absent from `game_metadata`):

   ```sql
   ALTER TABLE game_metadata ADD COLUMN logo_url TEXT;
   ```

5. **`video_urls`, `screenshot_urls`, `artwork_urls` arrays** — these are PostgreSQL `ARRAY`
   columns that have no SQLite equivalent. Keep them in place during Phase 1 on existing
   PostgreSQL deployments. The data migration in Phase 4 reads and inserts via application
   code (Rust/sqlx) rather than raw SQL.

#### `platform_metadata`

1. **Add `provider_id` FK** (same nullable-first strategy as `game_metadata`):

   ```sql
   ALTER TABLE platform_metadata
     ADD COLUMN provider_id INTEGER REFERENCES metadata_providers(id);
   ```

2. **Add `icon_url`**:

   ```sql
   ALTER TABLE platform_metadata ADD COLUMN icon_url TEXT;
   ```

#### `emulators`

The `supported_platforms` PostgreSQL `Array<Int4>` column will be replaced by the
`emulator_platform_maps` join table (Phase 1.3). Keep the column on existing PostgreSQL
deployments during Phase 1; the data migration in Phase 4 reads it via application code.

#### `local_emulator_configs`

Add the three new fields from the target data model:

```sql
ALTER TABLE local_emulator_configs
  ADD COLUMN default_profile_id    INTEGER REFERENCES emulator_profiles(id);
ALTER TABLE local_emulator_configs
  ADD COLUMN bios_directory        TEXT;
ALTER TABLE local_emulator_configs
  ADD COLUMN extra_files_directory TEXT;
```

---

### 1.3 New Relational Mapping Tables

#### `library_root_directory_maps`

Assigns root directories to libraries (many-to-many, so a directory can serve multiple
libraries).

```sql
CREATE TABLE library_root_directory_maps (
  library_id        INTEGER NOT NULL REFERENCES libraries(id)       ON DELETE CASCADE,
  root_directory_id INTEGER NOT NULL REFERENCES root_directories(id) ON DELETE CASCADE,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (library_id, root_directory_id)
);
```

#### `platform_root_directory_maps`

Assigns root directories to platforms.

```sql
CREATE TABLE platform_root_directory_maps (
  platform_id       INTEGER NOT NULL REFERENCES platforms(id)        ON DELETE CASCADE,
  root_directory_id INTEGER NOT NULL REFERENCES root_directories(id) ON DELETE CASCADE,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (platform_id, root_directory_id)
);
```

#### `game_root_directory_maps`

Assigns root directories to games.

```sql
CREATE TABLE game_root_directory_maps (
  game_id           INTEGER NOT NULL REFERENCES games(id)            ON DELETE CASCADE,
  root_directory_id INTEGER NOT NULL REFERENCES root_directories(id) ON DELETE CASCADE,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (game_id, root_directory_id)
);
```

#### `library_platform_maps`

```sql
CREATE TABLE library_platform_maps (
  library_id  INTEGER NOT NULL REFERENCES libraries(id)  ON DELETE CASCADE,
  platform_id INTEGER NOT NULL REFERENCES platforms(id)  ON DELETE CASCADE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (library_id, platform_id)
);
```

#### `game_platform_maps`

The target model expresses a many-to-many relationship between games and platforms. The current
schema uses a nullable `platform_id` FK on `games`. Both representations will coexist during
the migration window; the nullable FK is deprecated but not dropped until Phase 4.

```sql
CREATE TABLE game_platform_maps (
  game_id     INTEGER NOT NULL REFERENCES games(id)     ON DELETE CASCADE,
  platform_id INTEGER NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (game_id, platform_id)
);
```

#### `platform_tag_maps`

```sql
CREATE TABLE platform_tag_maps (
  platform_id INTEGER NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  tag_id      INTEGER NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (platform_id, tag_id)
);
```

#### `game_tag_maps`

```sql
CREATE TABLE game_tag_maps (
  game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  tag_id     INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (game_id, tag_id)
);
```

#### `emulator_platform_maps`

Replaces `emulators.supported_platforms Array<Int4>`.

```sql
CREATE TABLE emulator_platform_maps (
  emulator_id INTEGER NOT NULL REFERENCES emulators(id)  ON DELETE CASCADE,
  platform_id INTEGER NOT NULL REFERENCES platforms(id)  ON DELETE CASCADE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (emulator_id, platform_id)
);
```

---

### 1.4 Tables to Retire

The following tables are scheduled for removal **in Phase 4**, after data has been migrated to
their replacements. Do **not** remove them in Phase 1.

| Table | Replaced by |
|---|---|
| `game_genres` | `tags` |
| `game_genre_maps` | `game_tag_maps` |

The following **columns** are retired in Phase 4:

| Table.Column | Replaced by |
|---|---|
| `game_metadata.video_urls` | `video_metadata` table |
| `game_metadata.screenshot_urls` | `screenshot_metadata` table |
| `game_metadata.artwork_urls` | `artwork_metadata` table |
| `emulators.supported_platforms` | `emulator_platform_maps` table |
| `games.platform_id` (nullable FK) | `game_platform_maps` table |

---

### 1.5 Proto Model Updates

All changes below live in `packages/codegen/protos/retrom/`. After each change, run
`pnpm nx build codegen` to regenerate TypeScript client code. **Do not commit generated
Rust code** — Rust stubs are generated at compile-time by the Prost crate via `build.rs`.

#### New message files

**`retrom/models/libraries.proto`**

```protobuf
syntax = "proto3";
package retrom.models.libraries.v1;

import "google/protobuf/timestamp.proto";

message Library {
  int32  id                = 1;
  string name              = 2;
  string structure_definition = 3;
  google.protobuf.Timestamp created_at = 4;
  google.protobuf.Timestamp updated_at = 5;
}

message NewLibrary {
  string name                 = 1;
  string structure_definition = 2;
}

message UpdatedLibrary {
  int32  id                            = 1;
  optional string name                 = 2;
  optional string structure_definition = 3;
}
```

**`retrom/models/root-directories.proto`**

```protobuf
syntax = "proto3";
package retrom.models.root_directories.v1;

import "google/protobuf/timestamp.proto";

message RootDirectory {
  int32  id         = 1;
  string path       = 2;
  google.protobuf.Timestamp created_at = 3;
  google.protobuf.Timestamp updated_at = 4;
}

message NewRootDirectory {
  string path = 1;
}

message UpdatedRootDirectory {
  int32           id   = 1;
  optional string path = 2;
}
```

**`retrom/models/metadata-providers.proto`**

```protobuf
syntax = "proto3";
package retrom.models.metadata_providers.v1;

import "google/protobuf/timestamp.proto";

message MetadataProvider {
  int32  id   = 1;
  string name = 2;
  google.protobuf.Timestamp created_at = 3;
  google.protobuf.Timestamp updated_at = 4;
}
```

**`retrom/models/tags.proto`**

```protobuf
syntax = "proto3";
package retrom.models.tags.v1;

import "google/protobuf/timestamp.proto";

message Tag {
  int32  id    = 1;
  string key   = 2;
  string value = 3;
  google.protobuf.Timestamp created_at = 4;
  google.protobuf.Timestamp updated_at = 5;
}

message NewTag {
  string key   = 1;
  string value = 2;
}
```

**`retrom/models/media-metadata.proto`**

```protobuf
syntax = "proto3";
package retrom.models.media_metadata.v1;

import "google/protobuf/timestamp.proto";

message VideoMetadata {
  int32  id               = 1;
  int32  game_metadata_id = 2;
  string url              = 3;
  google.protobuf.Timestamp created_at = 4;
  google.protobuf.Timestamp updated_at = 5;
}

message ScreenshotMetadata {
  int32  id               = 1;
  int32  game_metadata_id = 2;
  string url              = 3;
  google.protobuf.Timestamp created_at = 4;
  google.protobuf.Timestamp updated_at = 5;
}

message ArtworkMetadata {
  int32  id               = 1;
  int32  game_metadata_id = 2;
  string url              = 3;
  google.protobuf.Timestamp created_at = 4;
  google.protobuf.Timestamp updated_at = 5;
}
```

#### Updated message files

**`retrom/models/metadata.proto`** — update `GameMetadata` and `PlatformMetadata`:

- `GameMetadata`: add `provider_id`, rename `cover_url` → `cover_image_url` and
  `background_url` → `background_image_url`, add `logo_url`. Remove the `video_urls`,
  `screenshot_urls`, `artwork_urls` repeated fields (replaced by the new message types above).
  Add `id` field.
- `PlatformMetadata`: add `provider_id`, add `icon_url`.

**`retrom/models/emulators.proto`** — update `LocalEmulatorConfig`:

- Add `default_profile_id`, `bios_directory`, `extra_files_directory`.

---

### 1.6 sqlx Schema and Model Updates

After each migration file is created under the sqlx migrations directory:

1. Run `sqlx migrate run` (or let `sqlx::migrate!` run at startup in tests) to apply.
2. Run `cargo sqlx prepare` (if using offline mode) to regenerate query metadata.
3. Add or update Rust model structs in `packages/db/src/` — derive `sqlx::FromRow` for
   query result structs as appropriate.
4. Run `pnpm nx cargo:lint retrom-db` and `pnpm nx cargo:format retrom-db` before committing.

---

### 1.7 Acceptance Criteria

- [ ] All new migrations apply cleanly from a fresh database (PostgreSQL and SQLite).
- [ ] All new migrations apply cleanly against a database that already has existing data.
- [ ] All new sqlx model structs compile without warnings.
- [ ] `pnpm nx cargo:test retrom-db` passes.
- [ ] `pnpm nx build codegen` succeeds with all new proto files.
- [ ] TypeScript types for all new proto messages are generated and exported from
      `@retrom/codegen`.

---

## Phase 2: Service Interface Redesign

> **Prerequisite:** Phase 1 complete (migrations applied, proto models available).

All proto changes live in `packages/codegen/protos/retrom/`. All Rust handler changes live in
their respective per-service crates (see Phase 3). Proto service definitions must use semantic
versioned package names (`retrom.services.<domain>.v1`).

### 2.1 Config Service (Replaces ServerService)

**Proto file:** `retrom/services/config/v1/config-service.proto` (new file; the existing
`server-service.proto` is deprecated in place with `option deprecated = true;`).

**Package:** `retrom.services.config.v1`

**New RPCs to add:**

```protobuf
syntax = "proto3";
package retrom.services.config.v1;

option deprecated = false; // new service — not deprecated

service ConfigService {
  // Existing (from ServerService)
  rpc GetServerInfo(GetServerInfoRequest) returns (GetServerInfoResponse);
  rpc GetServerConfig(GetServerConfigRequest) returns (GetServerConfigResponse);
  rpc UpdateServerConfig(UpdateServerConfigRequest) returns (UpdateServerConfigResponse);

  // New — client config persistence
  rpc GetClientConfig(GetClientConfigRequest) returns (GetClientConfigResponse);
  rpc UpsertClientConfig(UpsertClientConfigRequest) returns (UpsertClientConfigResponse);
}

message GetClientConfigRequest {
  int32 client_id = 1;
}

message GetClientConfigResponse {
  RetromClientConfig config = 1;
}

message UpsertClientConfigRequest {
  int32 client_id           = 1;
  RetromClientConfig config = 2;
}

message UpsertClientConfigResponse {
  RetromClientConfig config_updated = 1;
}
```

**Deprecated service file** (`server-service.proto`):

```protobuf
// Mark the entire file as deprecated so generators surface a warning.
option deprecated = true;

service ServerService {
  option deprecated = true;
  // ... existing RPCs remain for backward compatibility
}
```

**Rust handler changes (`packages/service-config/src/lib.rs`):**

- Implement `ConfigServiceHandlers` in the new `retrom-service-config` crate.
- Add `db_pool` to the handler struct.
- Implement `get_client_config` and `upsert_client_config` using a new `client_configs` table
  (see database note below).
- Export a `config_router() -> axum::Router` function that registers the service.

**Database note:** Client config persistence requires a new table:

```sql
CREATE TABLE client_configs (
  client_id  INTEGER PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  config     TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> Store `RetromClientConfig` serialised as JSON text. `TEXT` is used instead of `JSONB` for
> SQLite compatibility (`JSONB` is PostgreSQL-specific).

**Backward compatibility:** Register both `ConfigService` and a forwarding stub for
`ServerService` (which delegates to `ConfigService` internally) during the transition period.
Remove the stub once the client-web and Tauri plugins are updated.

---

### 2.2 Enhanced Library Service

The goal is to surface all game and platform CRUD operations through `LibraryService`, making
`GameService` and `PlatformService` redundant.

**Proto file:** `retrom/services/library/v1/library-service.proto`

**Package:** `retrom.services.library.v1`

```protobuf
syntax = "proto3";
package retrom.services.library.v1;

service LibraryService {
  // Existing
  rpc UpdateLibrary(UpdateLibraryRequest) returns (UpdateLibraryResponse);
  rpc UpdateLibraryMetadata(UpdateLibraryMetadataRequest) returns (UpdateLibraryMetadataResponse);
  rpc DeleteLibrary(DeleteLibraryRequest) returns (DeleteLibraryResponse);
  rpc DeleteMissingEntries(DeleteMissingEntriesRequest) returns (DeleteMissingEntriesResponse);

  // Library CRUD (new)
  rpc GetLibraries(GetLibrariesRequest) returns (GetLibrariesResponse);
  rpc CreateLibraries(CreateLibrariesRequest) returns (CreateLibrariesResponse);
  rpc UpdateLibraries(UpdateLibrariesRequest) returns (UpdateLibrariesResponse);

  // Root Directory management (new)
  rpc GetRootDirectories(GetRootDirectoriesRequest) returns (GetRootDirectoriesResponse);
  rpc CreateRootDirectories(CreateRootDirectoriesRequest) returns (CreateRootDirectoriesResponse);
  rpc UpdateRootDirectories(UpdateRootDirectoriesRequest) returns (UpdateRootDirectoriesResponse);
  rpc DeleteRootDirectories(DeleteRootDirectoriesRequest) returns (DeleteRootDirectoriesResponse);

  // Platform operations (migrated from PlatformService)
  rpc GetPlatforms(GetPlatformsRequest) returns (GetPlatformsResponse);
  rpc DeletePlatforms(DeletePlatformsRequest) returns (DeletePlatformsResponse);
  rpc UpdatePlatforms(UpdatePlatformsRequest) returns (UpdatePlatformsResponse);

  // Game operations (migrated from GameService)
  rpc GetGames(GetGamesRequest) returns (GetGamesResponse);
  rpc DeleteGames(DeleteGamesRequest) returns (DeleteGamesResponse);
  rpc UpdateGames(UpdateGamesRequest) returns (UpdateGamesResponse);
  rpc GetGameFiles(GetGameFilesRequest) returns (GetGameFilesResponse);
  rpc DeleteGameFiles(DeleteGameFilesRequest) returns (DeleteGameFilesResponse);
  rpc UpdateGameFiles(UpdateGameFilesRequest) returns (UpdateGameFilesResponse);

  // Tag management (new)
  rpc GetTags(GetTagsRequest) returns (GetTagsResponse);
  rpc CreateTags(CreateTagsRequest) returns (CreateTagsResponse);
  rpc DeleteTags(DeleteTagsRequest) returns (DeleteTagsResponse);
  rpc GetGameTags(GetGameTagsRequest) returns (GetGameTagsResponse);
  rpc UpdateGameTags(UpdateGameTagsRequest) returns (UpdateGameTagsResponse);
  rpc GetPlatformTags(GetPlatformTagsRequest) returns (GetPlatformTagsResponse);
  rpc UpdatePlatformTags(UpdatePlatformTagsRequest) returns (UpdatePlatformTagsResponse);
}
```

**Rust handler changes (`packages/service-library/src/lib.rs`):**

- Implement `LibraryServiceHandlers` in the `retrom-service-library` crate.
- Include sub-modules: `library_handlers.rs`, `root_directory_handlers.rs`, `tag_handlers.rs`,
  `game_handlers.rs`, `platform_handlers.rs`.
- Export a `library_router() -> axum::Router` function.

**Note on request/response types:** Request/response messages for game and platform RPCs being
moved are already defined in existing proto files. Since we are now using versioned packages,
define all new types in `retrom.services.library.v1`. Mark the originals in the old
`game-service.proto` and `platform-service.proto` files with `option deprecated = true;`.

---

### 2.3 Updated Metadata Service

**Proto file:** `retrom/services/metadata/v1/metadata-service.proto`

**Package:** `retrom.services.metadata.v1`

```protobuf
syntax = "proto3";
package retrom.services.metadata.v1;

service MetadataService {
  // Existing RPCs (unchanged signatures — see current metadata-service.proto)
  ...

  // Provider management (new)
  rpc GetMetadataProviders(GetMetadataProvidersRequest) returns (GetMetadataProvidersResponse);
}

message GetMetadataProvidersRequest {}

message GetMetadataProvidersResponse {
  repeated MetadataProvider providers = 1;
}
```

**Rust handler changes (`packages/service-metadata/src/lib.rs`):**

- Implement `MetadataServiceHandlers` in the `retrom-service-metadata` crate.
- `GetGameMetadata` and `GetPlatformMetadata` responses should include `provider_id` in the
  returned metadata.
- `UpdateGameMetadata` and `UpdatePlatformMetadata` should accept (and store) `provider_id`.
- `GetMetadataProviders` queries the `metadata_providers` table.
- Export a `metadata_router() -> axum::Router` function.

---

### 2.4 Updated Emulator Service

**Proto file:** `retrom/services/emulators/v1/emulator-service.proto`

**Package:** `retrom.services.emulators.v1`

```protobuf
syntax = "proto3";
package retrom.services.emulators.v1;

// Appended to EmulatorService:
rpc GetEmulatorPlatformMaps(GetEmulatorPlatformMapsRequest)
    returns (GetEmulatorPlatformMapsResponse);
rpc UpdateEmulatorPlatformMaps(UpdateEmulatorPlatformMapsRequest)
    returns (UpdateEmulatorPlatformMapsResponse);
rpc DeleteEmulatorPlatformMaps(DeleteEmulatorPlatformMapsRequest)
    returns (DeleteEmulatorPlatformMapsResponse);

message EmulatorPlatformMap {
  int32 emulator_id = 1;
  int32 platform_id = 2;
  google.protobuf.Timestamp created_at = 3;
  google.protobuf.Timestamp updated_at = 4;
}
```

**Rust handler changes (`packages/service-emulators/src/lib.rs`):**

- Implement `EmulatorServiceHandlers` in the `retrom-service-emulators` crate.
- `GetEmulators` response: derive `supported_platforms` from `emulator_platform_maps` via JOIN
  (for backward compatibility, keep populating the `Emulator.supported_platforms` repeated
  field until clients are updated to use the new RPCs).
- Implement the three new mapping RPCs.
- `UpdateEmulators`: update the mapping table when `supported_platforms` is supplied.
- Export an `emulators_router() -> axum::Router` function.

**Updated `LocalEmulatorConfig` proto messages** to include `default_profile_id`,
`bios_directory`, `extra_files_directory`.

---

### 2.5 Updated Client Service

**Rust handler changes (`packages/service-clients/src/lib.rs`):**

- Update `ClientServiceHandlers` to use `ConfigService`'s client config storage when creating
  or updating clients (as a convenience: creating a client can optionally seed an empty
  `client_configs` row).

No new RPCs are required here; client config persistence is handled by `ConfigService`.

---

### 2.6 Job Service (Dedicated gRPC Service Crate)

The `JobService` tracks the progress of long-running background operations (library scans,
metadata refreshes, etc.) and exposes that state to clients over gRPC. Job progress must **not**
be tracked through a shared in-process state object accessible only within the server process —
it must be queryable by any connected client over the wire.

**Proto file:** `retrom/services/jobs/v1/job-service.proto`

**Package:** `retrom.services.jobs.v1`

```protobuf
syntax = "proto3";
package retrom.services.jobs.v1;

import "google/protobuf/timestamp.proto";

service JobService {
  // Create and track a new job
  rpc CreateJob(CreateJobRequest) returns (CreateJobResponse);
  // Query current state of a job
  rpc GetJob(GetJobRequest) returns (GetJobResponse);
  // List all jobs (optionally filtered by status)
  rpc ListJobs(ListJobsRequest) returns (ListJobsResponse);
  // Subscribe to live progress updates for a job
  rpc WatchJob(WatchJobRequest) returns (stream JobProgress);
  // Mark a job complete or failed
  rpc CompleteJob(CompleteJobRequest) returns (CompleteJobResponse);
}

enum JobStatus {
  JOB_STATUS_UNSPECIFIED = 0;
  JOB_STATUS_PENDING     = 1;
  JOB_STATUS_RUNNING     = 2;
  JOB_STATUS_COMPLETE    = 3;
  JOB_STATUS_FAILED      = 4;
}

message Job {
  string    id          = 1;
  string    name        = 2;
  JobStatus status      = 3;
  float     progress    = 4; // 0.0–1.0
  string    message     = 5;
  google.protobuf.Timestamp created_at  = 6;
  google.protobuf.Timestamp updated_at  = 7;
  google.protobuf.Timestamp finished_at = 8;
}

message JobProgress {
  string    id       = 1;
  JobStatus status   = 2;
  float     progress = 3;
  string    message  = 4;
}
```

**Rust implementation (`packages/service-jobs/src/lib.rs`):**

- Implement a `JobManager` struct (internal to this crate) backed by an in-memory `DashMap`
  or a lightweight DB table for durability.
- The `JobService` gRPC handler creates, updates, and streams job state via the `JobManager`.
- Other service crates (library scan, metadata refresh, etc.) call into `JobService` via the
  Tonic client to create and update jobs — they do **not** take a direct Rust dependency on the
  `JobManager`. This keeps concerns cleanly separated across crate boundaries.
- Export a `jobs_router() -> axum::Router` function.

**Database note:** For durability across restarts, persist jobs in a `jobs` table:

```sql
CREATE TABLE jobs (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  progress    REAL NOT NULL DEFAULT 0.0,
  message     TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME
);
```

---

### 2.7 Saves Service

No proto interface changes planned in this refactor. The handler implementation moves to the
`retrom-service-saves` crate as part of Phase 3. Both v1 (`SavesService` —
`retrom.services.saves.v1`) and v2 (`EmulatorSavesService` — `retrom.services.saves.v2`)
remain interface-compatible.

---

### 2.8 Deprecated Services

The proto definitions for deprecated services and their messages **must** be annotated with
`option deprecated = true;` at both the file level and the service/message level. This causes
code-generation tools (Prost, protoc-gen-es) to surface deprecation warnings for any code
that still uses those definitions.

Example:

```protobuf
// game-service.proto
option deprecated = true;   // file-level

service GameService {
  option deprecated = true; // service-level
  rpc GetGames(GetGamesRequest) returns (GetGamesResponse) {
    option deprecated = true; // method-level
  }
  // ... all other RPCs also marked deprecated
}
```

Register forwarding stub implementations for the following services during the transition
period so that existing clients do not receive an immediate `Unimplemented` error:

| Service | Stub behaviour |
|---|---|
| `GameService` | Forward all RPCs to `LibraryService` (`retrom.services.library.v1`) equivalents |
| `PlatformService` | Forward all RPCs to `LibraryService` equivalents |
| `ServerService` | Forward all RPCs to `ConfigService` (`retrom.services.config.v1`) equivalents |
| `FileExplorerService` | Return `Unimplemented` status with a descriptive message |

Remove stubs and deregister the services in a subsequent minor release once all known clients
are updated. Track readiness in a dedicated issue.

---

### 2.9 Acceptance Criteria

- [ ] `pnpm nx build codegen` succeeds with all new/updated proto files.
- [ ] All deprecated proto files have `option deprecated = true;` at the file, service, and
      method levels.
- [ ] All new service RPCs are registered in the binary (`packages/service`) via their
      respective per-crate router functions.
- [ ] Deprecated service stubs are registered and return valid (forwarded or stubbed) responses.
- [ ] `pnpm nx cargo:lint` passes for all new service crates.
- [ ] `pnpm nx cargo:test` passes for all new service crates.
- [ ] Manual smoke test: `GetLibraries`, `GetGames`, `GetPlatforms`,
      `ConfigService/GetServerInfo` all return expected results against a seeded database.

---

## Phase 3: Service Decomposition

> Can begin as soon as Phase 2 handler logic is stable. Each service crate can be extracted
> independently; they do not need to all be done in one PR.

The goal is to break the monolithic `retrom-grpc-service` crate into per-domain crates, each
owning its handler logic and exporting an Axum `Router`. The binary in `packages/service`
assembles the routers.

### 3.1 Create Per-Service Crates

For each domain below, create a new Cargo crate following this pattern:

1. `cargo new --lib packages/service-<domain>` (or equivalent NX scaffold)
2. Declare the crate in `[workspace.members]` in the root `Cargo.toml`.
3. Add the appropriate `retrom-codegen`, `retrom-db`, `retrom-service-common`, `tonic`,
   `tonic-web`, `axum`, `tokio`, and `tracing` dependencies.
4. Move the handler implementation from `grpc-service/src/<domain>/` into the new crate's
   `src/lib.rs` (and sub-modules as needed).
5. Expose a `pub fn <domain>_router(db_pool: Arc<SqlitePool | PgPool>) -> axum::Router`
   function (use a `DbPool` type alias defined in `retrom-db`).
6. Add a `project.json` for NX integration.

**Crates to create:**

| New crate | Domain | Replaces |
|---|---|---|
| `retrom-service-library` | LibraryService | `grpc-service/src/library/` + `games.rs` + `platforms.rs` |
| `retrom-service-metadata` | MetadataService | `grpc-service/src/metadata/` |
| `retrom-service-emulators` | EmulatorService | `grpc-service/src/emulators/` |
| `retrom-service-clients` | ClientService | `grpc-service/src/clients/` |
| `retrom-service-config` | ConfigService | `grpc-service/src/server/` |
| `retrom-service-jobs` | JobService | `grpc-service/src/jobs/` |
| `retrom-service-saves` | SavesService (v1 + v2) | `grpc-service/src/saves/` |

---

### 3.2 Refactor retrom-db for sqlx + SQLite/PostgreSQL Support

The existing `retrom-db` crate uses Diesel and is PostgreSQL-only. This step replaces it with a
sqlx-based implementation that supports both SQLite (embedded mode, tests) and PostgreSQL
(production).

**Steps:**

1. Add `sqlx` with the `sqlite`, `postgres`, `runtime-tokio-rustls`, and `macros` features to
   `Cargo.toml`.
2. Replace all `diesel::prelude::*` imports and Diesel DSL query code with `sqlx::query!` /
   `sqlx::query_as!` macros.
3. Define a `DbPool` type alias:

   ```rust
   #[cfg(feature = "sqlite")]
   pub type DbPool = sqlx::SqlitePool;

   #[cfg(feature = "postgres")]
   pub type DbPool = sqlx::PgPool;
   ```

4. Move all migration files to `packages/db/migrations/` and use `sqlx::migrate!` for
   embedded migration execution.
5. Ensure all SQL in query macros uses only generic SQL (see Guiding Principle 5).
6. Remove `packages/db/src/schema.rs` (Diesel-generated; no longer needed).

---

### 3.3 MetadataProvider Registry in retrom-service-common

Currently `IGDBProvider` and `SteamWebApiProvider` are constructed directly in the service
binary. A `MetadataProviderRegistry` allows providers to be registered at startup and retrieved
by name or ID.

**Target file:** `packages/service-common/src/metadata_providers/registry.rs`

```rust
use std::collections::HashMap;
use std::sync::Arc;
use super::{GameMetadataProvider, PlatformMetadataProvider};

pub struct MetadataProviderRegistry {
    game_providers: HashMap<String, Arc<dyn GameMetadataProvider + Send + Sync>>,
    platform_providers: HashMap<String, Arc<dyn PlatformMetadataProvider + Send + Sync>>,
}

impl MetadataProviderRegistry {
    pub fn new() -> Self { ... }
    pub fn register_game_provider(
        &mut self, name: impl Into<String>, p: Arc<dyn GameMetadataProvider + Send + Sync>,
    ) { ... }
    pub fn register_platform_provider(
        &mut self, name: impl Into<String>, p: Arc<dyn PlatformMetadataProvider + Send + Sync>,
    ) { ... }
    pub fn game_provider(
        &self, name: &str,
    ) -> Option<Arc<dyn GameMetadataProvider + Send + Sync>> { ... }
    pub fn platform_provider(
        &self, name: &str,
    ) -> Option<Arc<dyn PlatformMetadataProvider + Send + Sync>> { ... }
}
```

Register IGDB and Steam at binary startup in `packages/service/src/lib.rs`.

---

### 3.4 Update Binary Wiring

After 3.1–3.3, `packages/service/src/lib.rs` assembles the routers from each domain crate:

```rust
use retrom_service_library::library_router;
use retrom_service_metadata::metadata_router;
use retrom_service_emulators::emulators_router;
use retrom_service_clients::clients_router;
use retrom_service_config::config_router;
use retrom_service_jobs::jobs_router;
use retrom_service_saves::saves_router;

let db_pool = Arc::new(retrom_db::connect(&db_url).await?);
let metadata_providers = Arc::new(build_metadata_provider_registry(&config));

let app = axum::Router::new()
    .merge(library_router(db_pool.clone()))
    .merge(metadata_router(db_pool.clone(), metadata_providers.clone()))
    .merge(emulators_router(db_pool.clone()))
    .merge(clients_router(db_pool.clone()))
    .merge(config_router(db_pool.clone(), config_manager.clone()))
    .merge(jobs_router(db_pool.clone()))
    .merge(saves_router(db_pool.clone()))
    // REST routes
    .merge(rest_router(...))
    // Deprecated stubs
    .merge(deprecated_game_service_stub(db_pool.clone()))
    .merge(deprecated_platform_service_stub(db_pool.clone()))
    .merge(deprecated_server_service_stub(db_pool.clone()));
```

The `grpc-service` crate becomes a transitional shell and is removed once all domain crates
are stable.

---

### 3.5 Acceptance Criteria

- [ ] Each new service crate compiles independently (`cargo build -p retrom-service-<domain>`).
- [ ] `retrom-db` compiles with `--features sqlite` and `--features postgres`.
- [ ] `MetadataProviderRegistry` is populated at startup with IGDB and Steam providers.
- [ ] `pnpm nx cargo:lint` passes for all new service crates and `retrom-db`.
- [ ] `pnpm nx cargo:test` passes for all new service crates.
- [ ] The binary starts and all registered services respond to a smoke test request.

---

## Phase 4: Data Migration

> **Prerequisite:** Phases 1, 2, and 3 are complete and deployed to a staging environment.
> Run migrations against a copy of production data before applying to production.

Each item below is a standalone sqlx migration. Because the source data (PostgreSQL `ARRAY`
columns, `game_genres`, etc.) uses PostgreSQL-specific types that are not representable in
SQLite, the "read from old shape, write to new shape" migrations are implemented as Rust
application code using `sqlx::query!` rather than raw SQL. This keeps the migration logic in
the type-safe, database-agnostic Rust layer rather than in database-flavored SQL scripts.

### 4.1 Seed Metadata Providers

This can be a plain SQL migration (compatible with both databases):

```sql
INSERT INTO metadata_providers (id, name) VALUES (1, 'IGDB')
  ON CONFLICT DO NOTHING;
INSERT INTO metadata_providers (id, name) VALUES (2, 'Steam')
  ON CONFLICT DO NOTHING;
```

### 4.2 Normalize Metadata Arrays

The existing `video_urls`, `screenshot_urls`, and `artwork_urls` columns are PostgreSQL
`ARRAY(TEXT)` — they have no SQLite equivalent. The normalisation is implemented as a
startup migration task in Rust:

```rust
// packages/service/src/migrations/normalize_metadata_arrays.rs
pub async fn run(pool: &PgPool) -> anyhow::Result<()> {
    let rows = sqlx::query!("SELECT id, video_urls, screenshot_urls, artwork_urls
                             FROM game_metadata")
        .fetch_all(pool).await?;

    for row in rows {
        for url in row.video_urls.unwrap_or_default() {
            sqlx::query!("INSERT INTO video_metadata (game_metadata_id, url)
                          VALUES ($1, $2) ON CONFLICT DO NOTHING",
                         row.id, url)
                .execute(pool).await?;
        }
        // ... screenshot_urls, artwork_urls similarly
    }

    // After all rows are migrated, drop the old columns (run as a separate migration step)
    Ok(())
}
```

After verifying row counts, apply a follow-up migration to drop the old columns:

```sql
-- PostgreSQL only (run after verification):
ALTER TABLE game_metadata DROP COLUMN video_urls;
ALTER TABLE game_metadata DROP COLUMN screenshot_urls;
ALTER TABLE game_metadata DROP COLUMN artwork_urls;
```

### 4.3 Normalize Emulator Platform Support

Same pattern — `supported_platforms` is a PostgreSQL `ARRAY(INT4)`:

```rust
// packages/service/src/migrations/normalize_emulator_platforms.rs
pub async fn run(pool: &PgPool) -> anyhow::Result<()> {
    let rows = sqlx::query!("SELECT id, supported_platforms FROM emulators")
        .fetch_all(pool).await?;

    for row in rows {
        for platform_id in row.supported_platforms.unwrap_or_default() {
            sqlx::query!("INSERT INTO emulator_platform_maps (emulator_id, platform_id)
                          VALUES ($1, $2) ON CONFLICT DO NOTHING",
                         row.id, platform_id)
                .execute(pool).await?;
        }
    }
    Ok(())
}
```

After verification:

```sql
ALTER TABLE emulators DROP COLUMN supported_platforms;
```

### 4.4 Migrate Library Model

> **Implementation note:** Because `ServerConfig.content_directories` is a runtime JSON file
> (not stored in the database), the library seeding migration cannot be a pure SQL migration.
> Implement a one-time startup task in `packages/service/src/lib.rs` that reads the config
> and, for each content directory:
>
> 1. Inserts a `Library` row if the `libraries` table is empty.
> 2. Inserts a `root_directories` row for the directory path (if not already present).
> 3. Inserts a `library_root_directory_maps` row linking the library to the directory.
>
> Guard the task with a check: if the `libraries` table is non-empty, skip. This task runs
> once on first boot after the migration.

### 4.5 Migrate Game-Platform Relationships

```sql
INSERT INTO game_platform_maps (game_id, platform_id)
SELECT g.id, g.platform_id
FROM games g
WHERE g.platform_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Defer dropping the column to a future release to maintain query compatibility:
-- ALTER TABLE games DROP COLUMN platform_id;
```

### 4.6 Migrate Genre Tags

```sql
-- Insert genre values as tags with key = 'genre'
INSERT INTO tags (key, value)
SELECT DISTINCT 'genre', gg.slug
FROM game_genres gg
ON CONFLICT DO NOTHING;

-- Map games to their genre tags
INSERT INTO game_tag_maps (game_id, tag_id)
SELECT ggm.game_id, t.id
FROM game_genre_maps ggm
JOIN game_genres     gg ON gg.id  = ggm.genre_id
JOIN tags             t  ON t.key = 'genre' AND t.value = gg.slug
ON CONFLICT DO NOTHING;

-- After verification:
-- DROP TABLE game_genre_maps;
-- DROP TABLE game_genres;
```

### 4.7 Acceptance Criteria

- [ ] All data migration scripts complete without errors on a copy of production data.
- [ ] Row counts in new tables match expected counts derived from old tables/columns.
- [ ] Application smoke tests pass after applying all migrations.
- [ ] Old columns / tables are dropped (or tracked in a follow-up issue if deferral is needed).

---

## Phase 5: Client Compatibility

> Can begin incrementally during Phases 2–4; must be complete before stubs are removed.

### 5.1 TypeScript Client Updates

**Package:** `packages/client-web`

- Replace all calls to `GameService` RPCs with equivalent `LibraryService` RPCs.
- Replace all calls to `PlatformService` RPCs with equivalent `LibraryService` RPCs.
- Replace all calls to `ServerService` RPCs with equivalent `ConfigService` RPCs.
- Update metadata-related calls to handle the new `provider_id` field on responses.
- Update emulator-related calls to use `GetEmulatorPlatformMaps` instead of reading
  `Emulator.supported_platforms` directly.
- Update any code reading `video_urls`, `screenshot_urls`, `artwork_urls` from `GameMetadata`
  to use the new `VideoMetadata`, `ScreenshotMetadata`, `ArtworkMetadata` messages.

### 5.2 Tauri Plugin Updates

**Package:** `plugins/retrom-plugin-service-client`

- Regenerate client code from updated protos (`pnpm nx build codegen`).
- Update any Rust-side code that calls `GameService`, `PlatformService`, or `ServerService`.

### 5.3 Acceptance Criteria

- [ ] `pnpm nx run-many -t typecheck` passes for all TypeScript packages.
- [ ] `pnpm nx run-many -t eslint:lint` passes for all TypeScript packages.
- [ ] `pnpm nx cargo:lint retrom-plugin-service-client` passes.
- [ ] End-to-end test: web client loads library, displays game metadata, launches a game.

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Breaking existing clients during service consolidation | High | High | Register deprecated service stubs with `option deprecated = true` protos; forward to new handlers; track client update readiness |
| `game_metadata` array normalization loses data on migration failure | Medium | High | Run Rust migration code against a copy of production data first; verify counts before dropping columns |
| `emulators.supported_platforms` migration breaks emulator-platform lookup | Medium | High | Keep old array column until `emulator_platform_maps` is verified; derive array from JOIN in API responses for backward compat |
| `libraries` table seeding is non-deterministic (config-driven) | Low | Medium | Implement startup seed task idempotently (check before insert); log clearly when seeding |
| Proto field renaming (`cover_url` → `cover_image_url`) breaks serialized messages | Medium | Medium | Use deprecated proto field annotations alongside new fields; serve both during transition |
| `FileExplorerService` removal breaks clients using directory browsing | Low | Low | Return `Unimplemented` with a clear message; document the deprecation in release notes |
| sqlx + SQLite support breaks existing query logic (especially PostgreSQL `ARRAY` queries) | High | High | Identified array columns are migrated via Rust application code; all new SQL uses generic syntax |
| Per-service crate decomposition causes extended merge divergence | Medium | Medium | Extract one crate at a time; keep `grpc-service` shell until all crates are stable |

---

## Dependency Map

```
Phase 1 (Data Layer + Proto models)
   │
   ├─► Phase 2 (Service Interface Redesign)
   │      │
   │      └─► Phase 5 (Client Compatibility)
   │
   ├─► Phase 3 (Service Decomposition + sqlx migration)
   │      │
   │      └─► (can proceed in parallel with Phase 2; merge after Phase 3 is stable)
   │
   └─► Phase 4 (Data Migration) ─── requires Phase 1 deployed + Phase 2 live
```

**Recommended execution order:**

1. Phase 1 (parallel tracks: schema migrations + proto model changes)
2. Phase 2 (service interface redesign; handler changes can begin in `grpc-service` immediately)
3. Phase 3.2 (sqlx / retrom-db rewrite — high-value, do early to unblock SQLite support)
4. Phase 3.1 + 3.3 + 3.4 (per-crate extraction + registry + binary wiring)
5. Phase 4 (data migration against staging, then production)
6. Phase 5 (client updates — can overlap with 2–4)

---

## Open Questions

1. **`FileExplorerService` fate** — the architecture spec does not include it. Should it be
   fully removed, moved to REST, or kept as an internal tool? Decision needed before Phase 2
   stub work.

2. **Library `structure_definition` encoding** — the field is stored as a `TEXT` JSON blob for
   SQLite compatibility. Should the server validate the JSON structure on write, and if so, at
   what layer (proto validation, sqlx, or application logic)?

3. **Backward compatibility window** — how many release cycles should deprecated service stubs
   remain registered? A suggested policy: stubs are removed no sooner than the release after the
   one in which client packages are updated, and no later than two minor releases after that.

4. **`games.platform_id` nullable FK** — after `game_platform_maps` is populated, should the
   old FK column be kept for single-platform convenience queries, or dropped entirely? Dropping
   it simplifies the schema but is a breaking change for any code doing
   `JOIN games ON games.platform_id = platforms.id`.

5. **Tag key/value constraints** — should well-known keys (e.g. `genre`, `play_status`,
   `region`) be enforced at the database level, or left open? An `ENUM` or a separate
   `tag_keys` table would enforce consistency but adds migration overhead when new keys are
   introduced.

6. **`client_configs` TEXT vs columns** — `RetromClientConfig` is deeply nested. Storing it as
   JSON text is portable, but makes server-side querying and partial updates more complex.
   Evaluate whether any server-side filtering on config values is needed before finalising the
   schema.

7. **sqlx offline mode** — should `cargo sqlx prepare` artifacts be committed to the repo so
   that CI can build without a live database, or should CI spin up a database container for all
   builds? The offline mode artifacts can cause drift if not kept in sync.

8. **Per-crate feature flags** — should each service crate expose a `sqlite` / `postgres`
   feature flag, or should the database backend be determined entirely by the `retrom-db` crate
   and injected as a `DbPool` at construction time?
