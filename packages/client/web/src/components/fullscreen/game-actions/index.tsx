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
import { UninstallGameAction } from "./uninstall-game";
import { DeleteGameAction } from "./delete-game";
import { HotkeyButton } from "../hotkey-button";
import { useState } from "react";
import { useHotkeys } from "@/providers/hotkeys";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusableElement, FocusContainer } from "../focus-container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EllipsisVerticalIcon } from "lucide-react";
import { DesktopOnly } from "@/lib/env";

declare global {
  export interface HotkeyZones {
    gameActionsOpen: boolean;
    gameActions: boolean;
  }
}

export function GameActions() {
  const [open, setOpen] = useState(false);

  useHotkeys({
    handlers: {
      PAGE_LEFT: {
        handler: () => setOpen(true),
        zone: "gameActionsOpen",
      },
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <HotkeyLayer
        id="game-actions"
        handlers={{ ACCEPT: { handler: () => setOpen(true) } }}
      >
        <SheetTrigger asChild>
          <FocusableElement opts={{ focusKey: "game-actions-open" }}>
            <Button
              variant="accent"
              className={cn(
                "h-full rounded-none px-2",
                "opacity-80 focus-hover:opacity-100 transition-all",
              )}
            >
              <EllipsisVerticalIcon height="2rem" width="2rem" />
            </Button>
          </FocusableElement>
        </SheetTrigger>
      </HotkeyLayer>

      <SheetContent>
        <HotkeyLayer
          id="game-actions"
          allowBubbling="never"
          handlers={{
            BACK: {
              handler: () => setOpen(false),
              zone: "gameActions",
            },
          }}
        >
          <FocusContainer
            initialFocus
            opts={{
              focusKey: "game-actions",
              isFocusBoundary: true,
              forceFocus: true,
            }}
          >
            <SheetHeader>
              <SheetTitle>Game Actions</SheetTitle>
              <SheetDescription>
                Perform actions on this game entry
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-2 h-full">
              <DesktopOnly>
                <UninstallGameAction />
              </DesktopOnly>

              <DeleteGameAction />
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <HotkeyButton hotkey="BACK">close</HotkeyButton>
              </SheetClose>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}
