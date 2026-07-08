import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
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
      <header
        className={cn(
          "sticky top-0 flex items-center justify-between px-2 pt-4 pb-2 h-14",
          "bg-background border-b",
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

      <Outlet />
    </AppSidebar>
  );
}

const sidebarConfig: SidebarConfig = {
  header: {
    items: [
      {
        type: "inline",
        content: (
          <Link
            to="/app"
            className="flex h-8 not-last:mb-2 gap-2 w-full relative items-center"
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
              route: "/app/games",
              label: (
                <>
                  <Gamepad /> Games
                </>
              ),
            },
            {
              type: "link",
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
        content: <ServerStatus />,
      },
      {
        type: "inline",
        content: (
          <Link to="/app/downloads">
            <InstallationTracker />
          </Link>
        ),
      },
      {
        type: "inline",
        content: (
          <div className="flex flex-row items-center justify-between">
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
