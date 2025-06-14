import { MenuRoot, MenuItem, canRender } from ".";
import { Separator } from "../ui/separator";
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
} from "../ui/sheet";
import { getPanelElement } from "react-resizable-panels";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Route as RootRoute } from "@/routes/__root";
import { ArrowLeft, Ellipsis, X } from "lucide-react";

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
            className="absolute h-auto"
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
              Array.isArray(sub) ? (
                <MobileMainMenuGroup items={sub} key={subIndex} />
              ) : (
                <MobileMainMenuItem key={subIndex} item={sub} />
              ),
            )}
          </SheetContent>
        </Sheet>

        <Separator
          className={cn(
            !lastInGroup && "hidden",
            "w-[95%] mx-auto last:hidden",
          )}
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
        className={cn(!lastInGroup && "hidden", "w-[95%] mx-auto last:hidden")}
      />
    </>
  );
}

function MobileMainMenuGroup(props: { items: MenuItem[] }) {
  const { items } = props;
  const renderableItems = items.filter(canRender);

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
          className="bg-background absolute h-auto group"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Retrom's main menu</SheetDescription>
          </SheetHeader>

          {root.items.map((item, index) =>
            Array.isArray(item) ? (
              <MobileMainMenuGroup items={item} key={index} />
            ) : (
              <MobileMainMenuItem key={index} item={item} />
            ),
          )}
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
