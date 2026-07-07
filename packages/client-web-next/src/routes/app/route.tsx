import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@retrom/ui-next/components/card";
import { SidebarTrigger } from "@retrom/ui-next/components/sidebar";
import {
  CirclePlay,
  Computer,
  Gamepad,
  Home,
  Library,
  Settings2,
} from "lucide-react";
import { Button } from "@retrom/ui-next/components/button";
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

      <div className="mt-24 p-8 w-[64ch]">
        <h3 className="font-heading text-3xl font-bold">Foo bar baz</h3>

        <p className="text-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In metus
          purus, porta ut lacus eu, egestas commodo lectus. Curabitur a orci
          bibendum, aliquam nibh non, luctus justo. Aenean tincidunt lectus sed
          massa laoreet, sit amet vestibulum risus viverra. In ultrices, urna
          sit amet dapibus molestie, massa dolor auctor metus, id dictum felis
          metus ac turpis. Sed gravida elit neque, sit amet scelerisque diam
          facilisis sit amet. Proin nec ligula sed orci pellentesque sodales.
          Donec tristique felis non quam porta mollis.
        </p>
      </div>

      <div className="p-8 flex flex-row gap-2">
        <Button variant="default">Click me</Button>
        <Button variant="secondary">Click me</Button>
        <Button variant="ghost">Click me</Button>
        <Button variant="outline">Click me</Button>
        <Button variant="destructive">Click me</Button>
      </div>

      <Card className="mx-8 w-[75ch]">
        <CardHeader>
          <CardTitle>Foo Magoo</CardTitle>
        </CardHeader>

        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In metus
          purus, porta ut lacus eu, egestas commodo lectus. Curabitur a orci
          bibendum, aliquam nibh non, luctus justo.
        </CardContent>

        <CardFooter>
          <Button variant="default">Click me</Button>
        </CardFooter>
      </Card>

      <div className="p-8 flex flex-row gap-2">
        <div className="p-8 bg-primary grid place-items-center">
          <h3 className="font-heading text-primary-foreground font-bold text-xl">
            Foo, bar, foobar
          </h3>

          <p className="text-primary-foreground text-sm text-pretty text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>

        <div className="p-8 bg-accent grid place-items-center">
          <h3 className="font-heading text-accent-foreground font-bold text-xl">
            Foo, bar, foobar
          </h3>

          <p className="text-accent-foreground text-sm text-pretty text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </div>

      <div className="px-8 flex flex-row gap-2">
        <div className="p-8 bg-muted grid place-items-center">
          <h3 className="font-heading text-muted-foreground font-bold text-xl">
            Foo, bar, foobar
          </h3>

          <p className="text-muted-foreground text-sm text-pretty text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>

        <div className="p-8 bg-secondary grid place-items-center">
          <h3 className="font-heading text-secondary-foreground font-bold text-xl">
            Foo, bar, foobar
          </h3>

          <p className="text-secondary-foreground text-sm text-pretty text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </div>

      <Outlet />
    </AppSidebar>
  );
}
