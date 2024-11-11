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
import { useUninstallGame } from "@/mutations/useUninstallGame";
import { useGameDetail } from "@/providers/game-details";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { FocusableElement, FocusContainer } from "../focus-container";
import { HotkeyLayer } from "@/providers/hotkeys/layers";

export function UninstallGameAction() {
  const [open, setOpen] = useState(false);
  const { game } = useGameDetail();

  const { mutateAsync: uninstall, status } = useUninstallGame(game);
  const disabled = status === "pending";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <FocusableElement opts={{ focusKey: "uninstall-game-action-open" }}>
          <MenuEntryButton>Uninstall Game</MenuEntryButton>
        </FocusableElement>
      </SheetTrigger>

      <SheetContent>
        <HotkeyLayer
          handlers={{
            BACK: { handler: () => setOpen(false) },
            MENU: { handler: () => uninstall() },
          }}
        >
          <FocusContainer
            initialFocus
            opts={{ focusKey: "uninstall-game-action", isFocusBoundary: true }}
          >
            <SheetHeader>
              <SheetTitle>Uninstall Game</SheetTitle>
              <SheetDescription>
                Are you sure you want to uninstall this game?
              </SheetDescription>
            </SheetHeader>

            <SheetFooter>
              <SheetClose asChild>
                <FocusableElement
                  opts={{ focusKey: "uninstall-game-action-close" }}
                >
                  <HotkeyButton disabled={disabled} hotkey="BACK">
                    Cancel
                  </HotkeyButton>
                </FocusableElement>
              </SheetClose>

              <FocusableElement
                opts={{ focusKey: "uninstall-game-action-confirm" }}
              >
                <HotkeyButton
                  disabled={disabled}
                  hotkey="MENU"
                  onClick={async () => {
                    await uninstall();
                    setOpen(false);
                  }}
                >
                  {status === "pending" ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </HotkeyButton>
              </FocusableElement>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}
