import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HotkeyHandlers } from "@/providers/hotkeys";
import { MenuEntryButton } from "./menu-entry-button";
import { HotkeyButton } from "../hotkey-button";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusableElement, FocusContainer } from "../focus-container";

declare global {
  export interface HotkeyZones {
    exitFullscreen: boolean;
  }
}

export function ExitFullscreen(props: ComponentProps<typeof SheetTrigger>) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const exit = useCallback(() => {
    navigate({ to: "/home" });
  }, [navigate]);

  const handlers = useMemo(
    () =>
      ({
        BACK: {
          handler: () => setOpen(false),
          zone: "exitFullscreen",
        },
        MENU: {
          handler: exit,
          zone: "exitFullscreen",
        },
      }) satisfies HotkeyHandlers,
    [exit],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <FocusableElement opts={{ focusKey: "exit-fullscreen-menu-open" }}>
          <MenuEntryButton {...props}>Exit fullscreen</MenuEntryButton>
        </FocusableElement>
      </SheetTrigger>

      <SheetContent>
        <FocusContainer
          opts={{ focusKey: "exit-fullscreen-menu", isFocusBoundary: true }}
        >
          <HotkeyLayer id="exit-fullscreen-menu" handlers={handlers}>
            <SheetHeader>
              <SheetTitle>Exit Fullscreen</SheetTitle>
              <SheetDescription>
                Exit fullscreen mode and return to the desktop interface
              </SheetDescription>
            </SheetHeader>

            <FocusableElement
              initialFocus
              opts={{ focusKey: "exit-fullscreen-trap" }}
            >
              <button className="opacity-0"></button>
            </FocusableElement>

            <SheetFooter>
              <SheetClose asChild>
                <HotkeyButton hotkey="BACK">back</HotkeyButton>
              </SheetClose>

              <HotkeyButton type="submit" hotkey="MENU" onClick={() => exit()}>
                Exit
              </HotkeyButton>
            </SheetFooter>
          </HotkeyLayer>
        </FocusContainer>
      </SheetContent>
    </Sheet>
  );
}
