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
    - [2.6 Job Service (Minimal Change)](#26-job-service-minimal-change)
    - [2.7 Saves Service (Minimal Change)](#27-saves-service-minimal-change)
    - [2.8 Deprecated Services](#28-deprecated-services)
    - [2.9 Acceptance Criteria](#29-acceptance-criteria)
  - [Phase 3: Infrastructure Refactoring](#phase-3-infrastructure-refactoring)
    - [3.1 Extract JobManager to retrom-service-common](#31-extract-jobmanager-to-retrom-service-common)
    - [3.2 Create Unified ServiceState in retrom-service-common](#32-create-unified-servicestate-in-retrom-service-common)
    - [3.3 MetadataProvider Registry in retrom-service-common](#33-metadataprovider-registry-in-retrom-service-common)
    - [3.4 Update grpc-service Wiring](#34-update-grpc-service-wiring)
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
- **Improve internal cohesion** — move `JobManager` out of `retrom-grpc-service` into
  `retrom-service-common`; introduce a unified `ServiceState` container.

### Guiding Principles

1. Each phase should leave the system in a releasable state.
2. Database migrations must be backward-safe where possible (add before remove).
3. Deprecated service RPCs are kept (as pass-through stubs) until all known clients are updated,
   then removed in a subsequent minor version.
4. Generated Rust protobuf code (in `packages/codegen/src/gen/`) is committed after every proto
   change so that building the service does not require the `buf` toolchain.

### Scope

| In Scope | Out of Scope |
|---|---|
| `packages/db` — schema and migrations | `packages/client-web` UI layer |
| `packages/codegen` — proto definitions and generated code | `packages/client` Tauri shell |
| `packages/grpc-service` — all gRPC handlers | Docker/deployment configuration |
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

The package structure remains largely the same; the most significant internal change is that
`JobManager` moves to `retrom-service-common` and a new `ServiceState` struct centralises
shared state for all gRPC handlers.

```
packages/
├── service/          # Binary (unchanged externally)
├── grpc-service/     # gRPC handlers (reorganised internally, same Cargo crate for now)
│   └── src/
│       ├── library/          # LibraryService (expanded — absorbs games + platforms)
│       ├── metadata/         # MetadataService (provider-aware)
│       ├── emulators/        # EmulatorService (mapping-table based)
│       ├── clients/          # ClientService (expanded with config persistence)
│       ├── config/           # ConfigService (renamed from server/)
│       ├── jobs/             # JobService (handler only; JobManager in service-common)
│       └── saves/            # SavesService (v1, v2 — unchanged)
├── rest-service/     # (unchanged)
├── webdav-service/   # (unchanged)
├── service-common/   # + JobManager, + ServiceState, + MetadataProviderRegistry
├── db/               # + new migrations, updated schema.rs
├── codegen/          # + new/updated proto files + regenerated Rust code
└── telemetry/        # (unchanged)
```

### Service Inventory

| Service | gRPC Package | Replaces / Notes |
|---|---|---|
| `ConfigService` | `retrom` | Replaces `ServerService`; adds client config persistence |
| `LibraryService` | `retrom` | Expanded; absorbs `GameService` and `PlatformService` |
| `MetadataService` | `retrom` | Updated; provider-aware |
| `EmulatorService` | `retrom` | Updated; mapping-table based |
| `ClientService` | `retrom` | Expanded with client config |
| `JobService` | `retrom` | Minimal change |
| `SavesService` (v1) | `retrom.services.saves.v1` | Unchanged |
| `EmulatorSavesService` (v2) | `retrom.services.saves.v2` | Unchanged |
| ~~`GameService`~~ | ~~`retrom`~~ | Deprecated — RPCs moved to `LibraryService` |
| ~~`PlatformService`~~ | ~~`retrom`~~ | Deprecated — RPCs moved to `LibraryService` |
| ~~`FileExplorerService`~~ | ~~`retrom`~~ | Deprecated — evaluate separate treatment |

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
  id                   SERIAL PRIMARY KEY,
  name                 TEXT NOT NULL,
  structure_definition TEXT NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
```

> `structure_definition` stores the scanning policy for this library (maps to the existing
> `StorageType` enum + `CustomLibraryDefinition` message; encode as JSON or a normalised
> sub-table — JSON is simpler for the initial implementation).

#### `root_directories`

Associates filesystem paths with a library.

```sql
CREATE TABLE root_directories (
  id         SERIAL PRIMARY KEY,
  library_id INT NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  path       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> In the current schema, each `platform` has a `path` column that doubles as a root directory.
> The new model separates the *scanning root* from the *entity identity*.

#### `metadata_providers`

Makes IGDB, Steam, and future providers first-class entities.

```sql
CREATE TABLE metadata_providers (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  id         SERIAL PRIMARY KEY,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (key, value)
);
```

#### `video_metadata`

Normalises `game_metadata.video_urls` into a proper relation.

```sql
CREATE TABLE video_metadata (
  id               SERIAL PRIMARY KEY,
  game_metadata_id INT NOT NULL REFERENCES game_metadata(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** this requires `game_metadata` to gain its own surrogate `id` column first (see
> [1.2](#12-modified-existing-tables)).

#### `screenshot_metadata`

Normalises `game_metadata.screenshot_urls`.

```sql
CREATE TABLE screenshot_metadata (
  id               SERIAL PRIMARY KEY,
  game_metadata_id INT NOT NULL REFERENCES game_metadata(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

#### `artwork_metadata`

Normalises `game_metadata.artwork_urls`.

```sql
CREATE TABLE artwork_metadata (
  id               SERIAL PRIMARY KEY,
  game_metadata_id INT NOT NULL REFERENCES game_metadata(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 1.2 Modified Existing Tables

Modifications to existing tables must be done in a separate migration that is safe to run
against a live database (add columns as `NULLABLE` first, backfill, then add constraints where
needed).

#### `game_metadata`

1. **Add surrogate `id` column** (required before `video_metadata`, `screenshot_metadata`,
   `artwork_metadata` can reference it):

   ```sql
   ALTER TABLE game_metadata ADD COLUMN id SERIAL;
   ALTER TABLE game_metadata ADD CONSTRAINT game_metadata_id_unique UNIQUE (id);
   ```

2. **Add `provider_id` FK** (nullable initially; backfill to IGDB provider id where
   `igdb_id IS NOT NULL`, Steam where applicable, then enforce `NOT NULL` in a follow-up
   migration once backfill is confirmed complete):

   ```sql
   ALTER TABLE game_metadata
     ADD COLUMN provider_id INT REFERENCES metadata_providers(id);
   ```

3. **Rename URL columns** (use `RENAME COLUMN` if zero-downtime is not required):

   ```sql
   ALTER TABLE game_metadata RENAME COLUMN cover_url      TO cover_image_url;
   ALTER TABLE game_metadata RENAME COLUMN background_url TO background_image_url;
   ```

4. **Add `logo_url`** (currently absent from `game_metadata`):

   ```sql
   ALTER TABLE game_metadata ADD COLUMN logo_url TEXT;
   ```

5. **`video_urls`, `screenshot_urls`, `artwork_urls` arrays** — keep these columns in place
   during Phase 1; they will be dropped in Phase 4 after data migration is complete.

#### `platform_metadata`

1. **Add `provider_id` FK** (same nullable-first strategy as `game_metadata`):

   ```sql
   ALTER TABLE platform_metadata
     ADD COLUMN provider_id INT REFERENCES metadata_providers(id);
   ```

2. **Add `icon_url`**:

   ```sql
   ALTER TABLE platform_metadata ADD COLUMN icon_url TEXT;
   ```

#### `emulators`

The `supported_platforms` `Array<Int4>` column will be replaced by the
`emulator_platform_maps` join table (Phase 1.3). Keep the column for the duration of Phase 1;
drop it in Phase 4 after migrating data.

#### `local_emulator_configs`

Add the three new fields from the target data model:

```sql
ALTER TABLE local_emulator_configs
  ADD COLUMN default_profile_id    INT REFERENCES emulator_profiles(id),
  ADD COLUMN bios_directory        TEXT,
  ADD COLUMN extra_files_directory TEXT;
```

---

### 1.3 New Relational Mapping Tables

#### `library_platform_maps`

```sql
CREATE TABLE library_platform_maps (
  library_id  INT NOT NULL REFERENCES libraries(id)  ON DELETE CASCADE,
  platform_id INT NOT NULL REFERENCES platforms(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (library_id, platform_id)
);
```

#### `game_platform_maps`

The target model expresses a many-to-many relationship between games and platforms. The current
schema uses a nullable `platform_id` FK on `games`. Both representations will coexist during
the migration window; the nullable FK is deprecated but not dropped until Phase 4.

```sql
CREATE TABLE game_platform_maps (
  game_id     INT NOT NULL REFERENCES games(id)     ON DELETE CASCADE,
  platform_id INT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (game_id, platform_id)
);
```

#### `platform_tag_maps`

```sql
CREATE TABLE platform_tag_maps (
  platform_id INT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  tag_id      INT NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (platform_id, tag_id)
);
```

#### `game_tag_maps`

```sql
CREATE TABLE game_tag_maps (
  game_id    INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  tag_id     INT NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (game_id, tag_id)
);
```

#### `emulator_platform_maps`

Replaces `emulators.supported_platforms Array<Int4>`.

```sql
CREATE TABLE emulator_platform_maps (
  emulator_id INT NOT NULL REFERENCES emulators(id)  ON DELETE CASCADE,
  platform_id INT NOT NULL REFERENCES platforms(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
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

All changes below live in `packages/codegen/protos/retrom/`. After each change, regenerate
TypeScript and Rust code with `pnpm nx build codegen` and commit the resulting files in
`packages/codegen/src/gen/` and `packages/codegen/dist/`.

#### New message files

**`retrom/models/libraries.proto`**

```protobuf
syntax = "proto3";
package retrom;

import "google/protobuf/timestamp.proto";
import "retrom/server/config.proto";

message Library {
  int32  id                = 1;
  string name              = 2;
  StorageType storage_type = 3;
  optional CustomLibraryDefinition custom_definition = 4;
  google.protobuf.Timestamp created_at = 5;
  google.protobuf.Timestamp updated_at = 6;
}

message NewLibrary {
  string name              = 1;
  StorageType storage_type = 2;
  optional CustomLibraryDefinition custom_definition = 3;
}

message UpdatedLibrary {
  int32  id                         = 1;
  optional string name              = 2;
  optional StorageType storage_type = 3;
  optional CustomLibraryDefinition custom_definition = 4;
}
```

**`retrom/models/root-directories.proto`**

```protobuf
syntax = "proto3";
package retrom;

import "google/protobuf/timestamp.proto";

message RootDirectory {
  int32  id         = 1;
  int32  library_id = 2;
  string path       = 3;
  google.protobuf.Timestamp created_at = 4;
  google.protobuf.Timestamp updated_at = 5;
}

message NewRootDirectory {
  int32  library_id = 1;
  string path       = 2;
}

message UpdatedRootDirectory {
  int32           id         = 1;
  optional int32  library_id = 2;
  optional string path       = 3;
}
```

**`retrom/models/metadata-providers.proto`**

```protobuf
syntax = "proto3";
package retrom;

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
package retrom;

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
package retrom;

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

### 1.6 Diesel Schema and Model Updates

After running each migration:

1. Run the diesel CLI or equivalent to regenerate `packages/db/src/schema.rs` (or manually
   update it to match the migration).
2. Update or add model structs — add `#[derive(Queryable, Insertable, AsChangeset)]` as
   appropriate.
3. Run `pnpm nx cargo:lint retrom-db` and `pnpm nx cargo:format retrom-db` before committing.

---

### 1.7 Acceptance Criteria

- [ ] All new migrations apply cleanly from a fresh database.
- [ ] All new migrations apply cleanly against a database that already has existing data.
- [ ] `schema.rs` reflects every new table and column addition.
- [ ] All new Diesel model structs compile without warnings.
- [ ] `pnpm nx cargo:test retrom-db` passes.
- [ ] `pnpm nx build codegen` succeeds; generated files are committed.
- [ ] TypeScript types for all new proto messages are generated and exported from
      `@retrom/codegen`.

---

## Phase 2: Service Interface Redesign

> **Prerequisite:** Phase 1 complete (migrations applied, proto models available).

All proto changes live in `packages/codegen/protos/retrom/services/`. All Rust handler changes
live in `packages/grpc-service/src/`.

### 2.1 Config Service (Replaces ServerService)

**Proto file:** rename `server-service.proto` → `config-service.proto`; update service name
from `ServerService` to `ConfigService`.

**New RPCs to add:**

```protobuf
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

**Rust handler changes (`packages/grpc-service/src/config/mod.rs`):**

- Rename `ServerServiceHandlers` → `ConfigServiceHandlers`.
- Add `db_pool: Arc<Pool>` to the handler struct.
- Implement `get_client_config` and `upsert_client_config` using a new `client_configs` table
  (see database note below).
- Wire `ConfigServiceServer` in place of `ServerServiceServer` in `lib.rs`.

**Database note:** Client config persistence requires a new table:

```sql
CREATE TABLE client_configs (
  client_id  INT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  config     JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> Store `RetromClientConfig` serialised as JSONB. This avoids a brittle column-per-field
> mapping for a deeply nested config struct that will change over time.

**Backward compatibility:** Register both `ConfigService` and a no-op stub for `ServerService`
during the transition period. Remove the stub once the client-web and Tauri plugins are updated.

---

### 2.2 Enhanced Library Service

The goal is to surface all game and platform CRUD operations through `LibraryService`, making
`GameService` and `PlatformService` redundant.

**Proto file:** `library-service.proto` — add the following RPCs:

```protobuf
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

**Rust handler changes (`packages/grpc-service/src/library/mod.rs`):**

- Add sub-modules: `library_handlers.rs`, `root_directory_handlers.rs`, `tag_handlers.rs`.
- Move game handler logic from `games.rs` into `library/game_handlers.rs`.
- Move platform handler logic from `platforms.rs` into `library/platform_handlers.rs`.
- Update `LibraryServiceHandlers` struct with any new dependencies.

**Note on request/response types:** The request/response messages for game and platform RPCs
being moved are already defined in `game-service.proto` and `platform-service.proto`. They can
be imported into `library-service.proto` without duplication, or copied and the originals
deprecated. Copying (with a comment pointing to the deprecation) is recommended to keep
`library-service.proto` self-contained.

---

### 2.3 Updated Metadata Service

**Proto file:** `metadata-service.proto` — add provider-aware RPCs:

```protobuf
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

**Rust handler changes (`packages/grpc-service/src/metadata/mod.rs`):**

- `GetGameMetadata` and `GetPlatformMetadata` responses should include `provider_id` in the
  returned metadata.
- `UpdateGameMetadata` and `UpdatePlatformMetadata` should accept (and store) `provider_id`.
- `GetMetadataProviders` queries the `metadata_providers` table.

---

### 2.4 Updated Emulator Service

**Proto file:** `emulator-service.proto` — add mapping-table RPCs:

```protobuf
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

**Rust handler changes (`packages/grpc-service/src/emulators/mod.rs`):**

- `GetEmulators` response: derive `supported_platforms` from `emulator_platform_maps` via JOIN
  (for backward compatibility, keep populating the `Emulator.supported_platforms` repeated
  field until clients are updated to use the new RPCs).
- Implement the three new mapping RPCs.
- `UpdateEmulators`: update the mapping table when `supported_platforms` is supplied.

**Updated `LocalEmulatorConfig` proto messages** to include `default_profile_id`,
`bios_directory`, `extra_files_directory`.

---

### 2.5 Updated Client Service

**Rust handler changes (`packages/grpc-service/src/clients/mod.rs`):**

- Update `ClientServiceHandlers` to use `ConfigService`'s client config storage when creating
  or updating clients (as a convenience: creating a client can optionally seed an empty
  `client_configs` row).

No new RPCs are required here; client config persistence is handled by `ConfigService`.

---

### 2.6 Job Service (Minimal Change)

No proto changes required. The handler implementation changes in Phase 3 when `JobManager` is
moved to `retrom-service-common`.

---

### 2.7 Saves Service (Minimal Change)

No changes planned in this refactor. Both v1 (`SavesService`) and v2 (`EmulatorSavesService`)
remain as-is.

---

### 2.8 Deprecated Services

Register stub implementations for the following services during the transition period so that
existing clients do not receive an immediate `Unimplemented` error:

| Service | Stub behaviour |
|---|---|
| `GameService` | Forward all RPCs to `LibraryService` equivalents |
| `PlatformService` | Forward all RPCs to `LibraryService` equivalents |
| `ServerService` | Forward all RPCs to `ConfigService` equivalents |
| `FileExplorerService` | Return `Unimplemented` status with a descriptive message |

Remove stubs and deregister the services in a subsequent minor release once all known clients
are updated. Track readiness in a dedicated issue.

---

### 2.9 Acceptance Criteria

- [ ] `pnpm nx build codegen` succeeds with all new/updated proto files.
- [ ] All new service RPCs are registered in `grpc_service()` in
      `packages/grpc-service/src/lib.rs`.
- [ ] Deprecated service stubs are registered and return valid (forwarded or stubbed) responses.
- [ ] `pnpm nx cargo:lint retrom-grpc-service` passes.
- [ ] `pnpm nx cargo:test retrom-grpc-service` passes.
- [ ] Manual smoke test: `GetLibraries`, `GetGames`, `GetPlatforms`,
      `ConfigService/GetServerInfo` all return expected results against a seeded database.

---

## Phase 3: Infrastructure Refactoring

> Can be done in parallel with Phase 2, but the `ServiceState` work (3.2) is best done after
> Phase 2's handler changes are in place, to avoid double-churn on handler constructors.

### 3.1 Extract JobManager to retrom-service-common

**Current location:** `packages/grpc-service/src/jobs/job_manager.rs`

**Target location:** `packages/service-common/src/jobs/mod.rs`

**Steps:**

1. Move `JobManager`, `JobError`, `JobOptions`, and related types to
   `packages/service-common/src/jobs/mod.rs`.
2. Add `pub mod jobs;` to `packages/service-common/src/lib.rs`.
3. Update all imports in `packages/grpc-service/src/` from the local path to
   `retrom_service_common::jobs::JobManager`.
4. Remove the now-empty `packages/grpc-service/src/jobs/job_manager.rs` file.
5. Keep `packages/grpc-service/src/jobs/mod.rs` as the `JobService` handler only.
6. Update `packages/grpc-service/Cargo.toml` — no new dependencies needed since
   `retrom-service-common` is already a dependency.

---

### 3.2 Create Unified ServiceState in retrom-service-common

Introduce a single `ServiceState` struct that holds all shared resources. This eliminates the
manual wiring of pools, caches, and managers across each handler constructor call in `lib.rs`.

**Target file:** `packages/service-common/src/service_state.rs`

```rust
use std::sync::Arc;
use crate::{
    config::ServerConfigManager,
    jobs::JobManager,
    media_cache::MediaCache,
    metadata_providers::MetadataProviderRegistry,
};
use retrom_db::Pool;

#[derive(Clone)]
pub struct ServiceState {
    /// Shared connection pool for services with moderate DB usage
    pub shared_pool: Arc<Pool>,
    /// Dedicated pool for the library service (high-volume DB operations)
    pub library_pool: Arc<Pool>,
    pub config_manager: Arc<ServerConfigManager>,
    pub job_manager: Arc<JobManager>,
    pub media_cache: Arc<MediaCache>,
    pub metadata_providers: Arc<MetadataProviderRegistry>,
}

impl ServiceState {
    pub fn new(db_url: &str, config_manager: Arc<ServerConfigManager>) -> Self { ... }
}
```

**Migration steps:**

1. Add `ServiceState` to `packages/service-common/src/service_state.rs`.
2. Expose it: `pub mod service_state;` and `pub use service_state::ServiceState;` in `lib.rs`.
3. Update `packages/grpc-service/src/lib.rs`: replace per-handler pool/config/manager
   construction with a single `ServiceState::new(...)` call, then pass `state.clone()` to each
   handler.
4. Update each handler struct to accept `ServiceState` (or `Arc<ServiceState>`) instead of
   individual fields.
5. Update `packages/service/src/lib.rs` to construct `ServiceState` and pass it to
   `grpc_service()`.

---

### 3.3 MetadataProvider Registry in retrom-service-common

Currently `IGDBProvider` and `SteamWebApiProvider` are constructed directly in `grpc_service()`.
A `MetadataProviderRegistry` allows providers to be registered at startup and retrieved by name
or ID, paving the way for future pluggable providers.

**Target file:** `packages/service-common/src/metadata_providers/registry.rs`

```rust
use std::collections::HashMap;
use std::sync::Arc;
use super::{GameMetadataProvider, PlatformMetadataProvider};

pub struct MetadataProviderRegistry {
    game_providers: HashMap<String, Arc<dyn GameMetadataProvider>>,
    platform_providers: HashMap<String, Arc<dyn PlatformMetadataProvider>>,
}

impl MetadataProviderRegistry {
    pub fn new() -> Self { ... }
    pub fn register_game_provider(
        &mut self, name: &str, p: Arc<dyn GameMetadataProvider>,
    ) { ... }
    pub fn register_platform_provider(
        &mut self, name: &str, p: Arc<dyn PlatformMetadataProvider>,
    ) { ... }
    pub fn game_provider(
        &self, name: &str,
    ) -> Option<Arc<dyn GameMetadataProvider>> { ... }
    pub fn platform_provider(
        &self, name: &str,
    ) -> Option<Arc<dyn PlatformMetadataProvider>> { ... }
}
```

Register IGDB and Steam in `ServiceState::new()`.

---

### 3.4 Update grpc-service Wiring

After 3.1–3.3, the `grpc_service()` function in `packages/grpc-service/src/lib.rs` should be
simplified to roughly:

```rust
pub fn grpc_service(state: Arc<ServiceState>) -> Router {
    let library_service  = LibraryServiceServer::new(LibraryServiceHandlers::new(state.clone()));
    let metadata_service =
        MetadataServiceServer::new(MetadataServiceHandlers::new(state.clone()));
    let emulator_service =
        EmulatorServiceServer::new(EmulatorServiceHandlers::new(state.clone()));
    let client_service   = ClientServiceServer::new(ClientServiceHandlers::new(state.clone()));
    let config_service   = ConfigServiceServer::new(ConfigServiceHandlers::new(state.clone()));
    let job_service      = JobServiceServer::new(JobServiceHandlers::new(state.clone()));
    let saves_service_v1 = SavesServiceServer::new(SavesServiceHandlers::new(state.clone()));
    let saves_service_v2 =
        EmulatorSavesServiceServer::new(EmulatorSavesServiceHandlers::new(state.clone()));

    // Stubs for deprecated services
    let game_service     = GameServiceServer::new(GameServiceStub::new(state.clone()));
    let platform_service = PlatformServiceServer::new(PlatformServiceStub::new(state.clone()));
    let server_service   = ServerServiceServer::new(ServerServiceStub::new(state.clone()));

    // ... build router as before
}
```

Update `packages/service/src/lib.rs` to:

```rust
let state = Arc::new(ServiceState::new(&db_url, config_manager.clone()));
let grpc_service = grpc_service(state);
```

---

### 3.5 Acceptance Criteria

- [ ] `JobManager` is no longer imported from `retrom_grpc_service`; only from
      `retrom_service_common`.
- [ ] `ServiceState` is used uniformly across all handler constructors.
- [ ] `MetadataProviderRegistry` is populated at startup with IGDB and Steam providers.
- [ ] `pnpm nx cargo:lint retrom-grpc-service retrom-service retrom-service-common` all pass.
- [ ] `pnpm nx cargo:test retrom-service-common` passes.

---

## Phase 4: Data Migration

> **Prerequisite:** Phases 1, 2, and 3 are complete and deployed to a staging environment.
> Run migrations against a copy of production data before applying to production.

Each item below is a standalone Diesel migration.

### 4.1 Seed Metadata Providers

```sql
INSERT INTO metadata_providers (id, name)
VALUES (1, 'IGDB'), (2, 'Steam')
ON CONFLICT DO NOTHING;
```

### 4.2 Normalize Metadata Arrays

#### Video metadata

```sql
INSERT INTO video_metadata (game_metadata_id, url)
SELECT m.id, unnest(m.video_urls)
FROM game_metadata m
WHERE array_length(m.video_urls, 1) > 0;
```

#### Screenshot metadata

```sql
INSERT INTO screenshot_metadata (game_metadata_id, url)
SELECT m.id, unnest(m.screenshot_urls)
FROM game_metadata m
WHERE array_length(m.screenshot_urls, 1) > 0;
```

#### Artwork metadata

```sql
INSERT INTO artwork_metadata (game_metadata_id, url)
SELECT m.id, unnest(m.artwork_urls)
FROM game_metadata m
WHERE array_length(m.artwork_urls, 1) > 0;
```

After verifying the data in the new tables, drop the old columns:

```sql
ALTER TABLE game_metadata
  DROP COLUMN video_urls,
  DROP COLUMN screenshot_urls,
  DROP COLUMN artwork_urls;
```

### 4.3 Normalize Emulator Platform Support

```sql
INSERT INTO emulator_platform_maps (emulator_id, platform_id)
SELECT e.id, unnest(e.supported_platforms)
FROM emulators e
WHERE array_length(e.supported_platforms, 1) > 0
ON CONFLICT DO NOTHING;

-- After verification:
ALTER TABLE emulators DROP COLUMN supported_platforms;
```

### 4.4 Migrate Library Model

> **Implementation note:** Because `ServerConfig.content_directories` is a runtime JSON file
> (not stored in the database), the library seeding migration cannot be a pure SQL migration.
> Implement a one-time startup task in `packages/service/src/lib.rs` that reads the config
> and inserts a `Library` + `RootDirectory` row for each content directory if none yet exist.
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
| Breaking existing clients during service consolidation | High | High | Register deprecated service stubs that forward to new handlers; track client update readiness |
| `game_metadata` array normalization loses data on migration failure | Medium | High | Run migration against a copy of production data first; verify counts before dropping columns |
| `emulators.supported_platforms` migration breaks emulator-platform lookup | Medium | High | Keep old array column until `emulator_platform_maps` is verified; derive array from JOIN in API responses for backward compat |
| `libraries` table seeding is non-deterministic (config-driven) | Low | Medium | Implement startup seed task idempotently (check before insert); log clearly when seeding |
| Proto field renaming (`cover_url` → `cover_image_url`) breaks serialized messages | Medium | Medium | Use deprecated proto field annotations alongside new fields; serve both during transition |
| `FileExplorerService` removal breaks clients using directory browsing | Low | Low | Return `Unimplemented` with a clear message; document the deprecation in release notes |
| Merge conflicts between Phase 2 and Phase 3 handler changes | Medium | Low | Do Phase 3 handler-constructor changes after Phase 2 handler logic is stable |

---

## Dependency Map

```
Phase 1 (Data Layer)
   │
   ├─► Phase 2 (Service Interfaces)
   │      │
   │      └─► Phase 5 (Client Compatibility)
   │
   ├─► Phase 3 (Infrastructure Refactoring)
   │      │
   │      └─► Phase 2 (can proceed in parallel; merge after Phase 3 is stable)
   │
   └─► Phase 4 (Data Migration) ─── requires Phase 1 deployed + Phase 2 live
```

**Recommended execution order:**

1. Phase 1 (parallel: schema migrations + proto model changes)
2. Phase 3.1 (JobManager extraction — low risk, do early)
3. Phase 2 (service redesign, handler changes)
4. Phase 3.2–3.4 (ServiceState + wiring cleanup)
5. Phase 4 (data migration against staging, then production)
6. Phase 5 (client updates — can overlap with 2–4)

---

## Open Questions

1. **`FileExplorerService` fate** — the architecture spec does not include it. Should it be
   fully removed, moved to REST, or kept as an internal tool? Decision needed before Phase 2
   stub work.

2. **Library `structure_definition` encoding** — should this be a JSONB column (flexible, maps
   directly to the proto `ServerConfig` message structure) or a set of normalised columns? JSONB
   is recommended for initial implementation; revisit if query patterns require normalised access.

3. **Backward compatibility window** — how many release cycles should deprecated service stubs
   remain registered? A suggested policy: stubs are removed no sooner than the release after the
   one in which client packages are updated, and no later than two minor releases after that.

4. **`games.platform_id` nullable FK** — after `game_platform_maps` is populated, should the
   old FK column be kept for single-platform convenience queries, or dropped entirely? Dropping
   it simplifies the schema but is a breaking change for any code doing
   `JOIN games ON games.platform_id = platforms.id`. Consider keeping it as a denormalised
   column (updated by a trigger) if query performance is a concern.

5. **Tag key/value constraints** — should well-known keys (e.g. `genre`, `play_status`,
   `region`) be enforced at the database level, or left open? An `ENUM` or a separate
   `tag_keys` table would enforce consistency but adds migration overhead when new keys are
   introduced.

6. **`client_configs` JSONB vs columns** — `RetromClientConfig` is deeply nested. JSONB is
   practical but makes server-side querying and partial updates more complex. Evaluate whether
   any server-side filtering on config values is needed before finalising the schema.
