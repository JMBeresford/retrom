# Protocol Buffers (Protobuf) Instructions

## Overview

The project uses Protocol Buffers (protobuf) for:

- Defining gRPC service APIs
- Generating TypeScript and Rust code
- Type-safe client-server communication

All protobuf definitions are in the `packages/codegen` package.

## Buf

**Buf** is used instead of `protoc` for protobuf compilation.

**Benefits**:

- Better performance
- Built-in linting and breaking change detection
- Dependency management
- Cleaner configuration

## Directory Structure

```
packages/codegen/
├── protos/               # Protobuf definitions
│   ├── service.proto     # Service definitions
│   └── types.proto       # Message types
├── src/
│   └── gen/              # Generated Rust code (committed)
├── dist/                 # Generated TypeScript code (gitignored)
├── buf.yaml              # Buf workspace configuration
└── buf.gen.yaml          # Code generation configuration
```

## Protobuf Files

### Writing Protobuf

**Location**: `packages/codegen/protos/`

**Example**:

```protobuf
syntax = "proto3";

package retrom.v1;

// Service definition
service GameService {
  rpc GetGame(GetGameRequest) returns (GetGameResponse);
  rpc ListGames(ListGamesRequest) returns (ListGamesResponse);
}

// Request message
message GetGameRequest {
  string id = 1;
}

// Response message
message GetGameResponse {
  Game game = 1;
}

// Data model
message Game {
  string id = 1;
  string title = 2;
  string description = 3;
}
```

### Best Practices

**Naming**:

- Use PascalCase for messages and services
- Use snake_case for field names
- Use ALL_CAPS for enum values

**Versioning**:

- Include version in package name: `package retrom.v1`
- Never change field numbers
- Mark deprecated fields instead of removing

**Field Numbers**:

- Reserve 1-15 for frequently used fields (1 byte encoding)
- Reserve 16+ for less common fields
- Never reuse field numbers

**Documentation**:

- Add comments to services, messages, and fields
- Comments become documentation in generated code

## Buf Configuration

### buf.yaml

#### Workspace configuration

```yaml
version: v2
modules:
  - path: protos
lint:
  use:
    - STANDARD
breaking:
  use:
    - FILE
```

**Linting rules**:

- `STANDARD` - Standard protobuf style rules
- Enforces naming conventions
- Checks for common mistakes

**Breaking change detection**:

- `FILE` - Checks for breaking changes at file level
- Prevents accidental API breaking changes

### buf.gen.yaml

#### Code generation configuration

```yaml
version: v2
plugins:
  # TypeScript (Connect-RPC)
  - local: protoc-gen-es
    out: dist
    opt:
      - target=ts
  - local: protoc-gen-connect-es
    out: dist
    opt:
      - target=ts
      
  # Rust (Tonic)
  - local: protoc-gen-tonic
    out: src/gen
    opt:
      - compile_well_known_types
```

**Generators**:

- **protoc-gen-es** - ES modules for TypeScript
- **protoc-gen-connect-es** - Connect-RPC clients
- **protoc-gen-tonic** - Tonic gRPC for Rust

## Code Generation

### Generate All Code

```bash
# Via NX (recommended)
pnpm nx build codegen

# Via Buf directly
cd packages/codegen
pnpm buf generate
```

**Output**:

- **TypeScript**: `packages/codegen/dist/`
- **Rust**: `packages/codegen/src/gen/`

### Rust Code

Generated Rust code is **committed to the repository**:

- Allows building without Buf toolchain
- Faster CI/CD builds
- Easier for contributors

**Location**: `packages/codegen/src/gen/`

**Generated items**:

- Service traits
- Message structs with Prost
- Client and server stubs

### TypeScript Code

Generated TypeScript code is **NOT committed** (gitignored):

- Regenerated during build
- Ensures fresh code
- Reduces repository size

**Location**: `packages/codegen/dist/` (gitignored)

**Generated items**:

- Message classes
- Service clients (Connect-RPC)
- Type definitions

## Using Generated Code

### In TypeScript

```typescript
import { Game } from '@retrom/codegen/types_pb';
import { createPromiseClient } from '@connectrpc/connect';
import { GameService } from '@retrom/codegen/service_connect';

// Create a client
const client = createPromiseClient(
  GameService,
  transport
);

// Use the client
const response = await client.getGame({ id: "123" });
const game: Game = response.game;
```

### In Rust

```rust
use retrom_codegen::gen::{
    game_service_server::{GameService, GameServiceServer},
    GetGameRequest, GetGameResponse, Game,
};
use tonic::{Request, Response, Status};

pub struct GameServiceImpl {
    // fields
}

#[tonic::async_trait]
impl GameService for GameServiceImpl {
    async fn get_game(
        &self,
        request: Request<GetGameRequest>,
    ) -> Result<Response<GetGameResponse>, Status> {
        let game = Game {
            id: request.into_inner().id,
            title: "Example".to_string(),
            description: "Description".to_string(),
        };
        
        Ok(Response::new(GetGameResponse {
            game: Some(game),
        }))
    }
}
```

## Formatting

Format protobuf files:

```bash
# Via NX (recommended)
pnpm nx buf:format codegen

# Check only (don't modify)
pnpm nx buf:format codegen --configuration check

# Via Buf directly
cd packages/codegen
pnpm buf format --write
pnpm buf format --diff --exit-code  # check only
```

## Linting

Buf includes built-in linting:

```bash
cd packages/codegen
pnpm buf lint
```

**Checks**:

- Naming conventions
- Field numbering
- Package structure
- Style consistency

## Breaking Changes

Check for breaking changes:

```bash
cd packages/codegen
pnpm buf breaking --against '.git#branch=main'
```

**What's considered breaking**:

- Removing fields
- Changing field types
- Changing field numbers
- Removing services or methods
- Changing message names

**Not breaking**:

- Adding new fields
- Adding new services
- Adding new methods
- Deprecating fields

## Workflow for API Changes

1. **Define changes** in `.proto` files
2. **Format** protobuf: `pnpm nx buf:format codegen`
3. **Lint** protobuf: `cd packages/codegen && pnpm buf lint`
4. **Check breaking changes** (optional): `pnpm buf breaking --against '.git#branch=main'`
5. **Generate code**: `pnpm nx build codegen`
6. **Update Rust services** to implement new/changed APIs
7. **Update TypeScript clients** to use new/changed APIs
8. **Test** changes end-to-end
9. **Commit** (includes Rust generated code)

## Connect-RPC

The project uses **Connect-RPC** for gRPC-Web communication.

**Benefits**:

- Works over HTTP/1.1 and HTTP/2
- Browser-compatible (no gRPC-Web proxy needed)
- Supports standard HTTP tools

**TypeScript client**:

```typescript
import { createConnectTransport } from '@connectrpc/connect-web';

const transport = createConnectTransport({
  baseUrl: 'http://localhost:5101',
});
```

**Rust server** (via Tonic with tonic-web):

```rust
use tonic_web::GrpcWebLayer;

let service = GameServiceServer::new(GameServiceImpl::new());

Router::new()
    .layer(GrpcWebLayer::new())
    .add_service(service)
```

## Tonic

The Rust backend uses **Tonic** for gRPC.

**Features**:

- Async/await with Tokio
- Streaming support
- Middleware with Tower
- TLS support

**Server setup**:

```rust
use tonic::transport::Server;

Server::builder()
    .add_service(GameServiceServer::new(service))
    .serve(addr)
    .await?;
```

**Client** (in Tauri plugins):

```rust
use retrom_codegen::gen::game_service_client::GameServiceClient;

let mut client = GameServiceClient::connect("http://localhost:5101").await?;
let response = client.get_game(GetGameRequest { id: "123".into() }).await?;
```

## Protobuf Extensions

The `packages/codegen/src/lib.rs` contains Rust extensions to generated code:

- Additional trait implementations
- Helper functions
- Conversion methods

**Example**:

```rust
// In packages/codegen/src/lib.rs
impl Game {
    pub fn new(id: String, title: String) -> Self {
        Self {
            id,
            title,
            description: String::new(),
        }
    }
}
```

## Common Patterns

### Optional Fields

```protobuf
message Game {
  string id = 1;
  optional string description = 2;  // May be absent
}
```

**In Rust**: `Option<String>`
**In TypeScript**: `string | undefined`

### Repeated Fields

```protobuf
message ListGamesResponse {
  repeated Game games = 1;
}
```

**In Rust**: `Vec<Game>`
**In TypeScript**: `Game[]`

### Enums

```protobuf
enum GameStatus {
  GAME_STATUS_UNSPECIFIED = 0;
  GAME_STATUS_ACTIVE = 1;
  GAME_STATUS_ARCHIVED = 2;
}
```

**Always include `_UNSPECIFIED` = 0** for default value.

### Timestamps

```protobuf
import "google/protobuf/timestamp.proto";

message Game {
  google.protobuf.Timestamp created_at = 5;
}
```

**In Rust**: `prost_types::Timestamp`
**In TypeScript**: `Timestamp` from well-known types

## Troubleshooting

### Generation Fails

```bash
# Check Buf installation
pnpm buf --version

# Check protobuf syntax
cd packages/codegen
pnpm buf lint

# Clear generated files and regenerate
rm -rf dist/ src/gen/
pnpm nx build codegen
```

### TypeScript Import Errors

```bash
# Ensure codegen is built
pnpm nx build codegen

# Check dist/ directory exists
ls packages/codegen/dist/

# Rebuild if needed
pnpm nx build codegen --skip-nx-cache
```

### Rust Compilation Errors

```bash
# Check generated Rust code exists
ls packages/codegen/src/gen/

# Regenerate if needed
cd packages/codegen
pnpm buf generate

# Check Rust compilation
cargo check -p retrom-codegen
```

## Best Practices

**API Design**:

- ✅ Use descriptive names for services and messages
- ✅ Group related operations in services
- ✅ Return well-defined error messages
- ✅ Use streaming for large data sets

**Versioning**:

- ✅ Include version in package name
- ✅ Never reuse field numbers
- ✅ Add new fields instead of modifying existing ones
- ✅ Use deprecation instead of removal

**Code Organization**:

- ✅ One service per file for clarity
- ✅ Shared types in separate files
- ✅ Keep generated code separate from extensions

**Development**:

- ✅ Format protobuf files before committing
- ✅ Regenerate code after protobuf changes
- ✅ Test generated code in both TS and Rust
- ✅ Check for breaking changes in PRs
