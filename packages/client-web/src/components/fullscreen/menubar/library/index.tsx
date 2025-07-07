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
} from "@retrom/ui/components/sheet";
import { MenuEntryButton } from "../menu-entry-button";
import { useState } from "react";
import { HotkeyButton } from "../../hotkey-button";
import { UpdateLibrary } from "./update-libary";
import { DownloadMetadata } from "./download-metadata";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusContainer } from "../../focus-container";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { Separator } from "@retrom/ui/components/separator";

export function Library(props: JSX.IntrinsicElements["button"]) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <MenuEntryButton id="library-menu-open" {...props}>
          Library
        </MenuEntryButton>
      </SheetTrigger>

      <SheetOverlay />
      <SheetContent>
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
            <FocusContainer
              opts={{
                focusKey: "library-menu",
                isFocusBoundary: true,
                initialFocus: true,
              }}
              className="flex flex-col h-full"
            >
              <UpdateLibrary />
              <DownloadMetadata />
            </FocusContainer>
          </ScrollArea>

          <SheetFooter>
            <SheetClose asChild>
              <HotkeyButton hotkey="BACK">back</HotkeyButton>
            </SheetClose>
          </SheetFooter>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}
