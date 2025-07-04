# Retrom Web Client

The Retrom Web Client is a React-based web application that serves as the primary user interface for the Retrom game library management system. It's designed to work both as a standalone web client and as the UI layer for the desktop application when wrapped by Tauri.

## Features

- Browse and manage your game library
- View and edit game metadata and artwork
- Configure emulator profiles
- Play games directly in the browser (via EmulatorJS)
- Download games from your library
- Launch games when used in desktop mode
- Fullscreen mode with controller navigation support
- Responsive design for various screen sizes

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [PNPM](https://pnpm.io/installation) for JavaScript package management

### Building and Running

#### Development Mode

To run the web client in development mode:

```bash
pnpm nx dev retrom-client-web
```

For development with desktop-specific features enabled:

```bash
pnpm nx dev:desktop retrom-client-web
```

#### Production Build

To create a production build for desktop integration:

```bash
pnpm nx build:desktop retrom-client-web
```

The built application will be in the `packages/client-web/dist` directory.

## Architecture

The web client is built with modern React patterns and follows a component-based architecture. Key aspects include:

### State Management

- [React Query](https://tanstack.com/query/) for server state management and data fetching
- React contexts for shared UI state
- [Zustand](https://github.com/pmndrs/zustand) for specific state management needs

### Routing

- [TanStack Router](https://tanstack.com/router/) for type-safe routing

### UI Components

The primitive UI components are initially provided by [shadcn/ui](https://ui.shadcn.com/docs) which is built on top of:

- Custom UI components built with [Radix UI](https://www.radix-ui.com/) primitives
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

### 3D Interface

- [Three.js](https://threejs.org/) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) for 3D elements in the fullscreen mode
- Controller navigation using [@noriginmedia/norigin-spatial-navigation](https://github.com/NoriginMedia/Norigin-Spatial-Navigation)

## Project Structure

- `/src/components` - UI components
- `/src/routes` - Application routes and page components
- `/src/providers` - Context providers for state management
- `/src/mutations` - Data mutation hooks (React Query)
- `/src/queries` - Data fetching hooks (React Query)
- `/src/lib` - Shared utilities and libraries
- `/src/utils` - Utility functions
- `/src/assets` - Static assets like images and fonts

## Desktop vs Web Mode

The web client can run in two different modes:

### Web Mode

In web mode, the client connects to a pre-defined remote Retrom server instance via HTTP/gRPC. This mode allows users to browse their library and download games but doesn't support native game launching or system integration.

The web client supports web-based emulation using [EmulatorJS](https://emulatorjs.org/)

### Desktop Mode

In desktop mode (when running inside the Tauri wrapper), additional features are enabled:

- Integration with local system via Tauri plugins
- Game installation/uninstallation
- Game launching via configured emulators
  - In addition to those supported by web-based emulation
- Steam library integration
- Local configuration management

The application detects which mode it's running in and conditionally renders appropriate features using the `DesktopOnly` and `WebOnly` components from `/src/lib/env.tsx`.

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [TanStack Router Documentation](https://tanstack.com/router/latest/docs/overview)
- [Tauri Documentation](https://tauri.app/)
- [EmulatorJS Documentation](https://github.com/EmulatorJS/EmulatorJS)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
