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
import { UninstallGameAction } from "./uninstall-game";
import { DeleteGameAction } from "./delete-game";
import { HotkeyButton } from "../hotkey-button";
import { useState } from "react";
import { useHotkeys } from "@/providers/hotkeys";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusContainer, useFocusable } from "../focus-container";
import { Button } from "@retrom/ui/components/button";
import { cn } from "@retrom/ui/lib/utils";
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
  const { ref } = useFocusable<HTMLButtonElement>({
    focusKey: "game-actions-open",
  });

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
          <Button
            ref={ref}
            variant="accent"
            className={cn(
              "h-full rounded-none px-2 focus:ring-2 focus:ring-ring",
              "opacity-80 focus-hover:opacity-100 transition-all",
            )}
          >
            <EllipsisVerticalIcon size={28} />
          </Button>
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
            className="flex flex-col h-full"
            opts={{
              initialFocus: true,
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
