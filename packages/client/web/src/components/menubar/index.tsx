import { cn } from "@/lib/utils";
import {
  MenubarContent,
  MenubarGroup,
  Menubar as MenubarImpl,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { libraryMenu } from "./library-menu";
import { platformsMenu } from "./platforms-menu";
import { emulatorsMenu } from "./emulators-menu";
import { fileMenu } from "./file-menu";
import { JobsIndicator } from "./jobs-indicator";
import { checkIsDesktop } from "@/lib/env";
import { Link, useNavigate } from "@tanstack/react-router";
import { viewMenu } from "./view-menu";
import { ConnectivityIndicator } from "./connectivity-indicator";
import { Menu, X } from "lucide-react";
import { FC, ReactNode } from "react";
import { Button } from "../ui/button";
import { Route as RootRoute } from "@/routes/__root";
import { MobileMenu } from "./mobile-menu";

type ApplicationContext = "desktop" | "web";
type ViewportContext = "desktop" | "mobile";

export type MenuItemGroup = {
  label?: ReactNode;
  groupItems: MenuItem[];
};

export interface MenuItem {
  label?: ReactNode;
  appContext?: ApplicationContext;
  viewportContext?: ViewportContext;
  Render?: ReactNode | FC;
  action?: () => void;
  items?: Array<MenuItem | MenuItemGroup>;
}

export type MenuRoot = Required<Pick<MenuItem, "items">>;

export function Menubar() {
  const menuItems: MenuRoot = {
    items: [fileMenu, libraryMenu, platformsMenu, emulatorsMenu, viewMenu],
  };

  return (
    <header
      className={cn(
        "sticky top-0 max-w-screen bg-background border-b flex z-40",
      )}
    >
      <span className="hidden sm:contents">
        <HomeButton />
        <DesktopMenu root={menuItems} />
        <Indicators />
      </span>

      <span className="sm:hidden flex w-full items-stretch justify-between py-2 relative">
        <MobileSidebarTrigger />
        <HomeButton />
        <MobileMenu root={menuItems} />
      </span>
    </header>
  );
}

function MobileSidebarTrigger() {
  const { mobileSidebar } = RootRoute.useSearch();
  const navigate = useNavigate();
  const { open = false } = mobileSidebar || {};

  return (
    <Button
      size="icon"
      variant="outline"
      className="ml-3"
      onClick={() => {
        navigate({
          to: ".",
          search: (prev) => ({
            ...prev,
            mobileSidebar: open ? undefined : { open: true },
          }),
        }).catch(console.error);
      }}
    >
      <X
        className={cn("transition-opacity", open ? "opacity-100" : "opacity-0")}
      />
      <Menu
        className={cn(
          "absolute transition-opacity",
          open ? "opacity-0" : "opacity-100",
        )}
      />
    </Button>
  );
}

function HomeButton() {
  return (
    <Link
      to="/home"
      className={cn(
        "font-black grid place-items-center text-xl leading-[0] sm:ml-5",
      )}
    >
      Retrom
    </Link>
  );
}

export const canRender = ({ appContext: context }: MenuItem) =>
  !(
    (context === "desktop" && !checkIsDesktop()) ||
    (context === "web" && checkIsDesktop())
  );

function MainMenuItem(props: { item: MenuItem }) {
  const { item } = props;
  const { Render, action, items, label } = item;

  if (!canRender(item)) {
    return <></>;
  }

  if (items) {
    return (
      <span
        className={cn(item.viewportContext === "mobile" ? "sm:hidden" : "")}
      >
        <MenubarSub>
          <MenubarSubTrigger asChild={typeof label !== "string"}>
            {label}
          </MenubarSubTrigger>
          <MenubarSubContent>
            {items.map((sub, subIndex) =>
              "groupItems" in sub ? (
                <MainMenuGroup group={sub} key={subIndex} />
              ) : (
                <MainMenuItem key={subIndex} item={sub} />
              ),
            )}
          </MenubarSubContent>
        </MenubarSub>
      </span>
    );
  }

  if (Render) {
    return (
      <MenubarItem
        asChild
        // onSelect={action}
        className={cn(item.viewportContext === "mobile" ? "sm:hidden" : "")}
      >
        {Render}
      </MenubarItem>
    );
  }

  return (
    <MenubarItem
      onSelect={action}
      className={cn(item.viewportContext === "mobile" ? "sm:hidden" : "")}
    >
      {label}
    </MenubarItem>
  );
}

function MainMenuGroup(props: { group: MenuItemGroup }) {
  const {
    group: { groupItems },
  } = props;

  if (!groupItems.some(canRender)) {
    return <></>;
  }

  return (
    <MenubarGroup className="group">
      {groupItems.map((item, index) => (
        <MainMenuItem key={index} item={item} />
      ))}

      <MenubarSeparator className="group-last:hidden" />
    </MenubarGroup>
  );
}

function DesktopMenu(props: { root: MenuRoot }) {
  const { root } = props;

  return (
    <MenubarImpl className="border-0 items-stretch w-full ml-4">
      {root.items.filter(canRender).map((item: MenuItem, index) => (
        <MenubarMenu key={index}>
          <MenubarTrigger
            className={cn(item.viewportContext === "mobile" ? "sm:hidden" : "")}
          >
            {item.label}
          </MenubarTrigger>
          <MenubarContent>
            {item.items?.map((sub, subIndex) =>
              "groupItems" in sub ? (
                <MainMenuGroup group={sub} key={subIndex} />
              ) : (
                <MainMenuItem key={subIndex} item={sub} />
              ),
            )}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </MenubarImpl>
  );
}

function Indicators() {
  return (
    <div className="h-full grid place-items-center grid-flow-col gap-2 mr-5">
      <JobsIndicator className="" />
      <ConnectivityIndicator />
    </div>
  );
}
