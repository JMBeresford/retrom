The Retrom Client is a desktop application built with [Tauri](https://tauri.app/) that serves as the primary way for users to interact with their Retrom game library. This application wraps the web client and adds desktop-specific functionality like game installation, launching, and integration with local systems.

## Features

- Install/uninstall games from your Retrom library
- Launch games using configured emulators
- Seamless Steam integration for managing your Steam library alongside Retrom
- Standalone mode for using Retrom without a dedicated server
- Configuration management for emulators and game launching
- System-level integration (file associations, protocol handlers)
- Automatic updates

## Development Setup

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [PNPM](https://pnpm.io/installation) for JavaScript package management
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites/) and its system dependencies

### Building and Running

#### Development Mode

The client depends on the web client being built or in development mode. You can run both simultaneously using NX:

```bash
pnpm nx dev retrom-client
```

This command will:

1. Start the web client in development mode with desktop-specific features enabled
2. Launch the Tauri application that wraps the web client

#### Production Build

To create a production build of the client:

```bash
pnpm nx build retrom-client --configuration prod
```

This will:

1. Build the web client optimized for desktop
2. Create a production build of the Tauri application

The built application can be found in `/target/release/bundle/` for release (production) builds or `/target/debug/bundle/` for debug builds.

## Internal Dependencies

The client package depends on several internal packages in the monorepo:

- `client-web`: The React-based web interface that provides the UI
- Plugins from the `/plugins` directory: For functionality like installation, launching,
  configuration, service communication, and platform integration
- `retrom-codegen`: Generated code for protocol buffers and other shared types

## External Dependencies

The client relies on several external libraries and frameworks:

- [Tauri](https://tauri.app/): Core framework for building the desktop application
- [Tokio](https://tokio.rs/): Asynchronous runtime for Rust
- [Tonic](https://github.com/hyperium/tonic): gRPC implementation for Rust
- [Tracing](https://github.com/tokio-rs/tracing): Structured logging and telemetry

## Configuration

The client can be configured using several methods:

1. **Tauri Configuration**: The `tauri.conf.json` file controls basic application settings like window size, application metadata, and update endpoints.

2. **Runtime Configuration**: The client uses `retrom-plugin-config` to manage user settings at runtime, which are stored locally and can include:
   - Service connection details
   - Emulator configurations
   - UI preferences
   - Telemetry settings

## Plugin Architecture

The client uses Tauri's plugin system to provide modular functionality. Each plugin is in its own package in the `plugins/` directory. This architecture makes it easy to extend the client with new features while keeping the codebase organized and maintainable.

Read more about tauri plugins in the documentation: [Tauri Plugins](https://tauri.app/develop/plugins/)

## Supported Platforms

The Retrom Client supports:

- Windows
- macOS
- Linux (Debian-based distributions, Fedora/RPM-based distributions, and AppImage)

## Troubleshooting

Logs are stored in the application data directory and can be useful for diagnosing issues:

- Windows: `%APPDATA%\com.retrom.client\logs\retrom.log`
- macOS: `~/Library/Logs/com.retrom.client/retrom.log`
- Linux: `~/.local/share/com.retrom.client/logs/retrom.log`

## Additional Resources

- [Tauri Documentation](https://tauri.app/start/)
- [Plugin-Specific READMEs](../../plugins/) for details on individual plugins
