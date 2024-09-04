import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ConfigProvider } from "../providers/config";
import { RetromClientProvider } from "../providers/retrom-client";
import { QueryClientProvider } from "../providers/query-client";
import { Menubar } from "../components/menubar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import { ScrollArea } from "../components/ui/scroll-area";
import { cn } from "../lib/utils";
import { Prompts } from "../components/prompts";
import { Toaster } from "../components/ui/toaster";
import { SideBar } from "@/components/side-bar";
import React from "react";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRoute({
  component: () => (
    <>
      <ConfigProvider>
        <RetromClientProvider>
          <QueryClientProvider>
            <div className="h-screen max-h-screen w-screen max-w-screen relative flex flex-col">
              <Menubar />
              <ResizablePanelGroup
                direction="horizontal"
                className="h-full w-full"
              >
                <ResizablePanel
                  defaultSize={25}
                  maxSize={40}
                  className="bg-muted"
                >
                  <ScrollArea
                    className={cn(
                      "h-full max-h-full w-full max-w-full",
                      "bg-gradient-to-b from-primary/5 to-background",
                    )}
                  >
                    <SideBar />
                  </ScrollArea>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={75}>
                  <ScrollArea className="h-full max-h-full w-full max-w-full">
                    <main className="p-5 pb-16">
                      <Outlet />
                    </main>
                  </ScrollArea>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>

            <Prompts />
            <Toaster />
          </QueryClientProvider>
        </RetromClientProvider>
      </ConfigProvider>
      <TanStackRouterDevtools />
    </>
  ),
  errorComponent: (opts) => <div>Error: {JSON.stringify(opts.error)}</div>,
});
