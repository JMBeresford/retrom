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
import { MenuEntryButton } from "../menu-entry-button";
import { useState } from "react";
import { HotkeyButton } from "../../hotkey-button";
import { UpdateLibrary } from "./update-libary";
import { DownloadMetadata } from "./download-metadata";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusableElement, FocusContainer } from "../../focus-container";

export function Library(props: JSX.IntrinsicElements["button"]) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <FocusableElement opts={{ focusKey: "library-menu-open" }}>
          <MenuEntryButton {...props}>Library</MenuEntryButton>
        </FocusableElement>
      </SheetTrigger>

      <SheetContent>
        <FocusContainer
          initialFocus
          opts={{ focusKey: "library-menu", isFocusBoundary: true }}
        >
          <HotkeyLayer
            id="library-menu"
            zones={{ menuRoot: false }}
            handlers={{
              BACK: {
                handler: () => setOpen(false),
              },
            }}
          >
            <SheetHeader>
              <SheetTitle>Library</SheetTitle>
              <SheetDescription>Retrom library operations</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 h-full ">
              <UpdateLibrary />
              <DownloadMetadata />
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <FocusableElement opts={{ focusKey: "library-menu-close" }}>
                  <HotkeyButton hotkey="BACK">back</HotkeyButton>
                </FocusableElement>
              </SheetClose>
            </SheetFooter>
          </HotkeyLayer>
        </FocusContainer>
      </SheetContent>
    </Sheet>
  );
}
