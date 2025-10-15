# Retrom UI

A collection of reusable UI components for the Retrom application, built with React and Tailwind CSS.

## Overview

This package includes components based on [shadcn/ui](https://ui.shadcn.com/) which are built on top of:

- [Radix UI](https://www.radix-ui.com/) primitives for accessibility and behavior
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

## Usage

```tsx
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@retrom/ui/components/dialog";
import { Button } from "@retrom/ui/components/button";

function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <p>Dialog content here</p>
      </DialogContent>
    </Dialog>
  );
}
```

## Development

### Building

```bash
pnpm nx run retrom-ui:build
```

### Linting

```bash
pnpm nx run retrom-ui:eslint:lint
```

### Formatting

```bash
pnpm nx run retrom-ui:prettier:format
```

## Dependencies

This package has minimal runtime dependencies and requires React 18+ as a peer dependency. All Radix UI components and styling utilities are included as direct dependencies.
