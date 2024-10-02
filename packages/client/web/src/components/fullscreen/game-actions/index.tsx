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
import { useGameDetail } from "@/providers/game-details";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { DeleteGameAction } from "./delete-game";
import { HotkeyButton } from "../hotkey-button";
import { useState } from "react";
import { useHotkeys } from "@/providers/hotkeys";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusableElement, FocusContainer } from "../focus-container";

declare global {
  export interface HotkeyZones {
    gameActionsOpen: boolean;
    gameActions: boolean;
  }
}

export function GameActions() {
  const [open, setOpen] = useState(false);
  const { game } = useGameDetail();
  const { data: installationState } = useInstallationQuery(game);

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
      <SheetTrigger asChild>
        <FocusableElement opts={{ focusKey: "game-actions-open" }}>
          <HotkeyButton hotkey="PAGE_LEFT">game actions</HotkeyButton>
        </FocusableElement>
      </SheetTrigger>

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
          <FocusContainer initialFocus opts={{ focusKey: "game-actions" }}>
            <SheetHeader>
              <SheetTitle>Game Actions</SheetTitle>
              <SheetDescription>
                Perform actions on this game entry
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-2 h-full">
              {installationState === InstallationStatus.INSTALLED ? (
                <UninstallGameAction />
              ) : (
                <></>
              )}

              <DeleteGameAction />
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <FocusableElement opts={{ focusKey: "game-actions-close" }}>
                  <HotkeyButton hotkey="BACK">close</HotkeyButton>
                </FocusableElement>
              </SheetClose>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}
