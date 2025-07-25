import { MenuRoot, MenuItem, canRender, MenuItemGroup } from ".";
import { Separator } from "@retrom/ui/components/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@retrom/ui/components/sheet";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@retrom/ui/lib/utils";
import { Button } from "@retrom/ui/components/button";
import { Route as RootRoute } from "@/routes/__root";
import { ArrowLeft, Ellipsis, X } from "lucide-react";
import { getPanelElement } from "@retrom/ui/components/resizable";

function MobileMainMenuItem(props: { item: MenuItem; lastInGroup?: boolean }) {
  const { item, lastInGroup } = props;
  const { Render, action, items, label } = item;
  const navigate = useNavigate();

  if (!canRender(item)) {
    return <></>;
  }

  if (items) {
    return (
      <span
        className={cn(
          item.viewportContext === "desktop" ? "hidden" : "contents",
        )}
      >
        <Sheet>
          <SheetTrigger className="text-lg my-1">{label}</SheetTrigger>

          <SheetOverlay className="absolute" />
          <SheetContent
            userCanClose={false}
            side="top"
            className="absolute h-auto py-6 px-4"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{item.label} Menu</SheetTitle>
              <SheetDescription>Retrom's {item.label} menu</SheetDescription>
            </SheetHeader>

            <SheetClose
              className={cn(
                "w-full flex gap-1 items-center",
                "text-muted-foreground text-sm leading-[0]",
              )}
            >
              <ArrowLeft size={14} /> back
            </SheetClose>

            {items.map((sub, subIndex) =>
              "groupItems" in sub ? (
                <MobileMainMenuGroup group={sub} key={subIndex} />
              ) : (
                <MobileMainMenuItem key={subIndex} item={sub} />
              ),
            )}
          </SheetContent>
        </Sheet>

        <Separator
          className={cn(!lastInGroup && "hidden", "mx-auto last:hidden")}
        />
      </span>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        asChild={!!Render}
        onClick={() => {
          if (action) {
            action();
            navigate({
              to: ".",
              search: (prev) => ({ ...prev, mobileMenu: undefined }),
            }).catch(console.error);
          }
        }}
        className={cn(
          item.viewportContext === "desktop" ? "hidden" : "block",
          "text-lg",
        )}
      >
        {Render ?? label}
      </Button>

      <Separator
        className={cn(!lastInGroup && "hidden", "mx-auto last:hidden")}
      />
    </>
  );
}

function MobileMainMenuGroup(props: { group: MenuItemGroup }) {
  const {
    group: { groupItems },
  } = props;

  const renderableItems = groupItems.filter(canRender);

  return renderableItems.map((item, index) => (
    <MobileMainMenuItem
      key={index}
      item={item}
      lastInGroup={index === renderableItems.length - 1}
    />
  ));
}

export function MobileMenu(props: { root: MenuRoot }) {
  const { root } = props;
  const container = getPanelElement("main-content");
  const { mobileMenu } = RootRoute.useSearch();
  const open = !!mobileMenu?.open;
  const navigate = useNavigate();

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        navigate({
          to: ".",
          search: (prev) => ({
            ...prev,
            mobileMenu: value ? { open: value } : undefined,
          }),
        }).catch(console.error);
      }}
    >
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="mr-3">
          {open ? <X /> : <Ellipsis />}
        </Button>
      </SheetTrigger>

      <SheetPortal container={container}>
        <SheetOverlay className="absolute" />
        <SheetContent
          userCanClose={false}
          side="top"
          className="bg-background absolute h-auto group py-6 px-4"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Retrom's main menu</SheetDescription>
          </SheetHeader>

          {root.items.map((item, index) =>
            "groupItems" in item ? (
              <MobileMainMenuGroup group={item} key={index} />
            ) : (
              <MobileMainMenuItem key={index} item={item} />
            ),
          )}
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
