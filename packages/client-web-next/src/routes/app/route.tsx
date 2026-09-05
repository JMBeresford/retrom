import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@retrom/ui-next/components/toast";
import { SidebarTrigger } from "@retrom/ui-next/components/sidebar";
import {
  CirclePlay,
  Computer,
  Gamepad,
  Home,
  Library,
  Settings2,
} from "lucide-react";
import { cn } from "@retrom/ui-next/lib/utils";
import { Separator } from "@retrom/ui-next/components/separator";
import { ScrollArea } from "@retrom/ui-next/components/scroll-area";
import { InstallationTracker } from "./-components/installation-tracker";
import { ServerStatus } from "./-components/server-status";
import { SearchCommand } from "./-components/search-command";
import type { SidebarConfig } from "@/sidebar";
import logo from "@/assets/Logo-2x.png";
import { AppSidebar } from "@/sidebar/app-sidebar";
import { ModeToggle } from "@/themes/mode-toggle";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppSidebar config={sidebarConfig}>
      <div className="relative h-dvh max-w-dvw grid grid-rows-[auto_1fr]">
        <header
          className={cn(
            "flex items-center justify-between px-2 pt-4 pb-2 h-14",
            "border-b z-49",
          )}
        >
          <div className="flex items-center gap-2">
            <SidebarTrigger size="icon-lg"></SidebarTrigger>
            <Separator orientation="vertical" className="mr-2" />
            <SearchCommand />
          </div>
          <div></div>
          <div></div>
        </header>

        <div className="relative h-full overflow-hidden flex flex-col">
          <ScrollArea className="px-4 h-full">
            <div className="py-4">
              <Outlet />
            </div>
          </ScrollArea>
        </div>

        <Toaster />
      </div>
    </AppSidebar>
  );
}

const sidebarConfig: SidebarConfig = {
  header: {
    items: [
      {
        type: "inline",
        size: "lg",
        render: ({ className, ...props }) => (
          <Link
            to="/app"
            className={cn(
              className,
              "h-12 w-full relative flex gap-2 items-center justify-start px-1",
              "hover:bg-sidebar-primary/10 hover:text-sidebar-foreground",
            )}
            {...props}
          >
            <img src={logo} className="size-8 rounded-md border" />
            <h2 className="font-heading text-2xl font-bold">Retrom</h2>
          </Link>
        ),
      },
    ],
  },

  groups: [
    {
      menus: [
        {
          items: [
            {
              type: "link",
              route: "/app",
              label: (
                <>
                  <Home /> Home
                </>
              ),
            },
            {
              type: "link",
              route: "/app/browse",
              label: (
                <>
                  <Gamepad /> Browse
                </>
              ),
            },
            {
              type: "link",
              hidden: true,
              route: "/app/platforms",
              label: (
                <>
                  <Computer /> Platforms
                </>
              ),
            },
            {
              type: "link",
              route: "/app/libraries",
              label: (
                <>
                  <Library /> Libraries
                </>
              ),
            },
            {
              type: "link",
              route: "/app/emulators",
              label: (
                <>
                  <CirclePlay /> Emulators
                </>
              ),
            },
            {
              type: "subMenu",
              label: {
                children: (
                  <>
                    <Settings2 /> Settings
                  </>
                ),
              },
              subMenu: {
                items: [
                  {
                    type: "link",
                    route: "/app/config/interface",
                    label: "Interface",
                  },
                  {
                    type: "link",
                    route: "/app/config/metadata",
                    label: "Metadata",
                  },
                  {
                    type: "link",
                    route: "/app/config/cloud-saves",
                    label: "Cloud Saves",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],

  footer: {
    items: [
      {
        type: "inline",
        size: "lg",
        render: (props) => <InstallationTracker {...props} />,
      },
      {
        type: "inline",
        size: "default",
        render: (props) => <ServerStatus {...props} />,
      },
      {
        type: "inline",
        render: ({ className, ...props }) => (
          <div
            className={cn(
              className,
              "p-0 flex flex-row items-center justify-between",
            )}
            {...props}
          >
            <ModeToggle />
            <span className="text-sm text-muted-foreground">
              Version: 0.7.45
            </span>
          </div>
        ),
      },
    ],
  },
};
