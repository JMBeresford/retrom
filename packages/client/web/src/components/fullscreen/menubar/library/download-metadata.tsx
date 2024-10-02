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
import { ComponentProps, useState } from "react";
import { MenuEntryButton } from "../menu-entry-button";
import { HotkeyButton } from "../../hotkey-button";
import { useUpdateLibraryMetadata } from "@/mutations/useUpdateLibraryMetadata";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusableElement, FocusContainer } from "../../focus-container";

export function DownloadMetadata(props: ComponentProps<typeof SheetTrigger>) {
  const { mutate: downloadMetadata } = useUpdateLibraryMetadata();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger {...props} asChild>
        <FocusableElement opts={{ focusKey: "download-metadata-open" }}>
          <MenuEntryButton>Download Metadata</MenuEntryButton>
        </FocusableElement>
      </SheetTrigger>

      <SheetContent>
        <FocusContainer
          initialFocus
          opts={{
            focusKey: "download-metadata-menu",
            isFocusBoundary: true,
          }}
        >
          <HotkeyLayer
            id="download-metadata"
            handlers={{
              BACK: {
                handler: () => setOpen(false),
              },
              MENU: {
                handler: () => {
                  downloadMetadata();
                  setOpen(false);
                },
              },
            }}
          >
            <SheetHeader>
              <SheetTitle>Download Metadata</SheetTitle>
              <SheetDescription>Update your library metadata</SheetDescription>
            </SheetHeader>

            <SheetFooter>
              <FocusableElement opts={{ focusKey: "download-metadata-close" }}>
                <SheetClose asChild>
                  <HotkeyButton hotkey="BACK">close</HotkeyButton>
                </SheetClose>
              </FocusableElement>

              <FocusableElement
                opts={{ focusKey: "download-metadata-download" }}
              >
                <HotkeyButton
                  hotkey="MENU"
                  onClick={() => {
                    downloadMetadata();
                    setOpen(false);
                  }}
                >
                  Download
                </HotkeyButton>
              </FocusableElement>
            </SheetFooter>
          </HotkeyLayer>
        </FocusContainer>
      </SheetContent>
    </Sheet>
  );
}
