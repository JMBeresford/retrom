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
import { useCallback, useState } from "react";
import { MenuEntryButton } from "../menu-entry-button";
import { useUpdateLibrary } from "@/mutations/useUpdateLibrary";
import { HotkeyButton } from "../../hotkey-button";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusContainer } from "../../focus-container";

export function UpdateLibrary() {
  const { mutateAsync: updateLibrary } = useUpdateLibrary();
  const [open, setOpen] = useState(false);

  const handleUpdate = useCallback(async () => {
    await updateLibrary();
    setOpen(false);
  }, [updateLibrary, setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <MenuEntryButton id="update-library-open">
          Update Library
        </MenuEntryButton>
      </SheetTrigger>

      <SheetContent>
        <HotkeyLayer
          id="update-library"
          handlers={{
            BACK: {
              handler: () => setOpen(false),
            },
            MENU: {
              handler: handleUpdate,
            },
          }}
        >
          <SheetHeader>
            <SheetTitle>Update Library</SheetTitle>
            <SheetDescription>Update Retrom library</SheetDescription>
          </SheetHeader>

          <FocusContainer
            opts={{
              focusKey: "update-library-menu",
              initialFocus: true,
              isFocusBoundary: true,
            }}
            className="block"
          >
            <SheetFooter className="px-2">
              <SheetClose asChild>
                <HotkeyButton
                  focusOpts={{ focusKey: "update-library-menu-close" }}
                  hotkey="BACK"
                >
                  back
                </HotkeyButton>
              </SheetClose>

              <HotkeyButton
                focusOpts={{ focusKey: "update-library-menu-confirm" }}
                hotkey="MENU"
                onClick={handleUpdate}
              >
                Update
              </HotkeyButton>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}
