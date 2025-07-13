import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@retrom/ui/components/sheet";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HotkeyHandlers } from "@/providers/hotkeys";
import { MenuEntryButton } from "./menu-entry-button";
import { HotkeyButton } from "../hotkey-button";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusContainer } from "../focus-container";

declare global {
  export interface HotkeyZones {
    exitFullscreen: boolean;
  }
}

export function ExitFullscreen(props: ComponentProps<typeof SheetTrigger>) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const exit = useCallback(() => {
    return navigate({ to: "/home" });
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
        <MenuEntryButton id="exit-fullscreen-menu-open" {...props}>
          Exit fullscreen
        </MenuEntryButton>
      </SheetTrigger>

      <SheetContent>
        <HotkeyLayer id="exit-fullscreen-menu" handlers={handlers}>
          <SheetHeader>
            <SheetTitle>Exit Fullscreen</SheetTitle>
            <SheetDescription>Return to the desktop interface</SheetDescription>
          </SheetHeader>

          <FocusContainer
            opts={{
              focusKey: "exit-fullscreen-menu",
              isFocusBoundary: true,
              initialFocus: true,
            }}
            className="w-full"
          >
            <SheetFooter className="px-2 justify-between">
              <SheetClose asChild>
                <HotkeyButton
                  className="w-1/2"
                  focusOpts={{ focusKey: "exit-fullscreen-menu-close" }}
                  hotkey="BACK"
                >
                  back
                </HotkeyButton>
              </SheetClose>

              <HotkeyButton
                focusOpts={{ focusKey: "exit-fullscreen-menu-confirm" }}
                className="w-1/2"
                type="submit"
                hotkey="MENU"
                onClick={exit}
              >
                Exit
              </HotkeyButton>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}
