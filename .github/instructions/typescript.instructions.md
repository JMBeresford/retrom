# TypeScript Development Instructions

## Technology Stack

This project uses TypeScript with the following key technologies:

- **React 18** - UI framework
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Radix UI** - Unstyled, accessible UI components
- **Tailwind CSS v4** - Utility-first styling
- **Vite** - Build tool and dev server
- **Tauri Plugins** - Desktop app integration (client-web package)

## Coding Standards

### TypeScript Configuration

- Use the base configuration from `@retrom/configs/tsconfig/base.json`
- Project references are used for workspace organization
- Enable strict type checking

### ESLint Rules

The project uses `typescript-eslint` with the following key rules:

- **Unused variables**: Prefix with `_` to indicate intentionally unused (e.g., `_param`)
- **Namespaces**: Allowed (rule disabled)
- **Short-circuit expressions**: Allowed in unused expressions
- **Misused promises**: Warnings for void return checking
- **Type-checked linting**: Enabled via `projectService`

### Formatting

- **Prettier** is the primary formatter for TypeScript/JavaScript files
- All TypeScript packages should format code before committing
- Use the `check` configuration to verify formatting in CI

### Type Checking

- **Required before commit**: All TypeScript code must pass type checking
- Run type checking across all packages: `pnpm nx run-many -t typecheck`
- Individual package type checking: `pnpm nx typecheck <package-name>`

## React Patterns

### State Management

- **Server state**: Use TanStack Query for API data, caching, and synchronization
- **Client state**: Use Zustand for local UI state
- **Form state**: Use React Hook Form with Zod validation

### Routing

- Use TanStack Router for type-safe routing
- Route files use the file-based routing pattern
- Route parameters and search params are fully typed

### Component Patterns

- Prefer functional components with hooks
- Use Radix UI primitives for accessible components
- Style with Tailwind CSS utilities
- Use `class-variance-authority` (CVA) for variant-based component APIs
- Combine classes with `tailwind-merge` to avoid conflicts

### UI Components

The `@retrom/ui` package provides shared UI components:

- Built on Radix UI primitives
- Styled with Tailwind CSS
- Uses CVA for variants
- Peer dependencies for flexibility

## Build and Development

### Vite Configuration

- TypeScript packages use Vite for building and development
- Plugin support for React, SSL (basic-ssl), GLSL shaders
- Build output goes to `dist/` directory

### Package Structure

TypeScript packages typically include:

- `src/` - Source code
- `dist/` - Build output (git-ignored)
- `eslint.config.js` - Package-specific ESLint config extending base
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration with project references
- `project.json` - NX project configuration

## Workspace Packages

### @retrom/client-web

The main web application:

- React SPA with TanStack Router
- Communicates with backend via Connect-RPC (gRPC-Web)
- Tauri plugin integration for desktop features
- OpenTelemetry instrumentation for observability
- Three.js for 3D rendering features

### @retrom/ui

Shared UI component library:

- Headless components built on Radix UI
- Exported as individual modules
- Peer dependencies model for flexibility
- Built with Vite and vite-plugin-dts for type definitions

### @retrom/codegen

Code generation package:

- Generates TypeScript types from protobuf definitions
- Uses Buf for code generation
- Shared between client and service code

## Common Dependencies

### State and Data

- `@tanstack/react-query` - Server state management
- `zustand` - Client state management
- `@hookform/resolvers` + `zod` - Form validation

### UI and Styling

- `lucide-react` - Icon library
- `tailwindcss` v4 - Styling
- `class-variance-authority` - Variant handling
- `tailwind-merge` - Class merging utility

### Desktop Integration (client-web)

- `@tauri-apps/api` - Core Tauri APIs
- `@tauri-apps/plugin-*` - Various Tauri plugins
- Custom plugins from workspace (`@retrom/plugin-*`)

## Pre-Commit Checklist

Before committing TypeScript changes:

1. **Format code**: `pnpm nx run-many -t prettier:format -p <packages>`
2. **Lint code**: `pnpm nx run-many -t eslint:lint -p <packages>`
3. **Type check**: `pnpm nx run-many -t typecheck`
4. **Sync NX workspace**: `pnpm nx sync`

## Best Practices

### Imports

- Use workspace protocol for internal packages: `@retrom/*`
- Prefer named imports over default imports for clarity
- Group imports: external, workspace, relative

### Error Handling

- Use Zod for runtime validation at boundaries
- Type errors explicitly when catching
- Avoid silently catching errors

### Performance

- Use React.memo() judiciously for expensive components
- Leverage TanStack Query's caching
- Use code splitting with React.lazy() for large features

### Accessibility

- Use Radix UI primitives for accessible patterns
- Provide appropriate ARIA labels
- Ensure keyboard navigation works

## NX Integration

TypeScript packages integrate with NX for:

- `build` - Build the package with Vite
- `dev` - Start development server
- `typecheck` - Type check the package
- `eslint:lint` - Lint with ESLint
- `prettier:format` - Format with Prettier

Run commands with: `pnpm nx <target> <package-name>`
