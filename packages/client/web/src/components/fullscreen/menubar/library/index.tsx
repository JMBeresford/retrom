import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Library(props: JSX.IntrinsicElements["button"]) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <FocusableElement opts={{ focusKey: "library-menu-open" }}>
          <MenuEntryButton {...props}>Library</MenuEntryButton>
        </FocusableElement>
      </SheetTrigger>

      <SheetOverlay />
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

            <Separator className="w-[90%] mx-auto" />

            <ScrollArea className="h-full w-full">
              <div className="flex flex-col h-full">
                <UpdateLibrary />
                <DownloadMetadata />
              </div>
            </ScrollArea>

            <SheetFooter>
              <SheetClose asChild>
                <HotkeyButton hotkey="BACK">back</HotkeyButton>
              </SheetClose>
            </SheetFooter>
          </HotkeyLayer>
        </FocusContainer>
      </SheetContent>
    </Sheet>
  );
}
