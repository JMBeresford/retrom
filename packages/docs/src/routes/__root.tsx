import { Router } from "@/main";
import { cn } from "@retrom/ui/lib/utils";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import {
  createRootRoute,
  Link,
  Outlet,
  ToPathOption,
  useRouterState,
} from "@tanstack/react-router";
import { memo } from "react";

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: (opts) => <div>Error: {String(opts.error)}</div>,
});

type AllRoutePaths = ToPathOption<Router, "/", undefined>;
type DocsRoutePaths = Extract<AllRoutePaths, `/docs/${string}`>;
const routes: Record<DocsRoutePaths, string> = {
  "/docs/quick-start": "Quick Start",
  "/docs/installation": "Installation",
  "/docs/configuration": "Configuration",
  "/docs/library-structure": "Library Structure",
  "/docs/metadata-providers": "Metadata Providers",
  "/docs/migration-guides": "Migration Guides",
  "/docs/emulators-config": "Emulators Config",
  "/docs/nix": "Nix",
  "/docs/third-party-integrations": "Third Party Integrations",
  "/docs/updating": "Updating",
};

const Sidebar = memo(function Sidebar() {
  const { pathname } = useRouterState().location;

  return (
    <nav className="flex flex-col gap-4 border-r p-4 pr-8">
      <Link to="/" className="text-2xl font-black">
        Retrom Docs
      </Link>

      <div className="flex flex-col">
        {Object.entries(routes).map(([path, label]) => {
          const active = pathname === path;

          return (
            <Link
              to={path}
              key={path}
              className={cn(
                "pl-2 py-1 border-l-2 transition-colors",
                "text-muted-foreground border-muted-foreground/20",
                "hover:text-foreground hover:border-foreground",
                active && "text-foreground border-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

function RootComponent() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 max-h-screen">
        <ScrollArea className="h-full">
          <div className="px-6 pt-4 pb-8">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
