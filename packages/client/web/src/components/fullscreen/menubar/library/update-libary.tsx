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
import { FocusableElement, FocusContainer } from "../../focus-container";

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
        <FocusableElement opts={{ focusKey: "update-library-open" }}>
          <MenuEntryButton>Update Library</MenuEntryButton>
        </FocusableElement>
      </SheetTrigger>

      <SheetContent>
        <FocusContainer
          initialFocus
          opts={{
            focusKey: "update-library-menu",
            isFocusBoundary: true,
          }}
        >
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

            <SheetFooter>
              <SheetClose asChild>
                <FocusableElement opts={{ focusKey: "update-library-close" }}>
                  <HotkeyButton hotkey="BACK">close</HotkeyButton>
                </FocusableElement>
              </SheetClose>

              <FocusableElement opts={{ focusKey: "update-library-confirm" }}>
                <HotkeyButton hotkey="MENU" onClick={() => handleUpdate()}>
                  Update
                </HotkeyButton>
              </FocusableElement>
            </SheetFooter>
          </HotkeyLayer>
        </FocusContainer>
      </SheetContent>
    </Sheet>
  );
}
