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
import { MenuEntryButton } from "../menubar/menu-entry-button";
import { HotkeyButton } from "../hotkey-button";
import { useCallback, useState } from "react";
import { ConfigCheckbox } from "../menubar/config-inputs/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useDeleteGames } from "@/mutations/useDeleteGames";
import { useGameDetail } from "@/providers/game-details";
import { useNavigate } from "@tanstack/react-router";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusableElement, FocusContainer } from "../focus-container";

declare global {
  export interface HotkeyZones {
    deleteGameAction: boolean;
  }
}

export function DeleteGameAction() {
  const { game } = useGameDetail();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [fromDisk, setFromDisk] = useState<CheckedState>(false);
  const [blacklistEntries, setBlacklistEntries] = useState<CheckedState>(false);

  const { mutate: deleteGame } = useDeleteGames();

  const handleDelete = useCallback(() => {
    deleteGame({
      ids: [game.id],
      deleteFromDisk: fromDisk === true,
      blacklistEntries: blacklistEntries === true,
    });

    navigate({
      to: "/fullscreen",
    });
  }, [game, fromDisk, deleteGame, blacklistEntries, navigate]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <FocusableElement opts={{ focusKey: "delete-game-action-open" }}>
          <MenuEntryButton>Delete Game</MenuEntryButton>
        </FocusableElement>
      </SheetTrigger>

      <SheetContent>
        <HotkeyLayer
          zones={{ gameActions: false }}
          handlers={{
            BACK: { handler: () => setOpen(false), zone: "deleteGameAction" },
            MENU: { handler: handleDelete, zone: "deleteGameAction" },
          }}
        >
          <FocusContainer
            initialFocus
            opts={{ focusKey: "delete-game-action" }}
          >
            <SheetHeader>
              <SheetTitle>Delete Game</SheetTitle>
              <SheetDescription>
                Are you sure you want to delete this game?
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col h-full gap-6">
              <p>
                You can either delete the entry from the database or delete the
                game from the disk.
              </p>

              <p>
                Deleting only the entry will leave your file system as is, but
                Retrom will ignore the game's directory moving forward.
              </p>

              <ConfigCheckbox
                label="Delete from disk"
                checked={fromDisk}
                onCheckedChange={setFromDisk}
              >
                <p className="text-sm text-muted-foreground">
                  This will alter the filesystem
                </p>
              </ConfigCheckbox>

              <ConfigCheckbox
                label="Blacklist Entries"
                checked={blacklistEntries}
                onCheckedChange={setBlacklistEntries}
              >
                <p className="text-sm text-muted-foreground">
                  Enabling this will prevent the game and its files from being
                  re-imported in any future library scans
                </p>
              </ConfigCheckbox>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <FocusableElement
                  opts={{ focusKey: "delete-game-action-close" }}
                >
                  <HotkeyButton hotkey="BACK">Cancel</HotkeyButton>
                </FocusableElement>
              </SheetClose>

              <FocusableElement
                opts={{ focusKey: "delete-game-action-confirm" }}
              >
                <HotkeyButton hotkey="MENU" onClick={handleDelete}>
                  Delete
                </HotkeyButton>
              </FocusableElement>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}