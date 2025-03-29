import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExitFullscreen } from "./exit-fullscreen";
import { Config } from "./config";
import { HotkeyButton } from "../hotkey-button";
import { Library } from "./library";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useState } from "react";
import { useHotkeys } from "@/providers/hotkeys";
import { FocusContainer } from "../focus-container";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

declare global {
  export interface HotkeyZones {
    menuBar: boolean;
    menuRoot: boolean;
  }
}

export function MenuSheet(props: JSX.IntrinsicElements["button"]) {
  const [open, setOpen] = useState(false);

  useHotkeys({
    handlers: {
      MENU: { handler: () => setOpen(true), zone: "menuBar" },
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <HotkeyButton {...props} hotkey="MENU">
          menu
        </HotkeyButton>
      </SheetTrigger>

      <SheetPortal>
        <SheetOverlay />
        <SheetContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <FocusContainer
            initialFocus
            opts={{ focusKey: "menu-root", isFocusBoundary: true }}
          >
            <HotkeyLayer
              id="menu-root"
              allowBubbling="never"
              handlers={{
                BACK: { handler: () => setOpen(false), zone: "menuRoot" },
              }}
            >
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Retrom configuration menu</SheetDescription>
              </SheetHeader>

              <Separator className="w-[90%] mx-auto" />

              <ScrollArea className="h-full w-full outline-none">
                <div className="flex flex-col h-full">
                  <Library />
                  <Config />
                  <ExitFullscreen />
                </div>
              </ScrollArea>

              <SheetFooter>
                <SheetClose asChild>
                  <HotkeyButton hotkey="BACK">close</HotkeyButton>
                </SheetClose>
              </SheetFooter>
            </HotkeyLayer>
          </FocusContainer>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
