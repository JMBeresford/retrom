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
import { ComponentProps, useState } from "react";
import { MenuEntryButton } from "../menu-entry-button";
import { HotkeyButton } from "../../hotkey-button";
import { useUpdateLibraryMetadata } from "@/mutations/useUpdateLibraryMetadata";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusContainer } from "../../focus-container";

export function DownloadMetadata(props: ComponentProps<typeof SheetTrigger>) {
  const { mutate: downloadMetadata } = useUpdateLibraryMetadata();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger {...props} asChild>
        <MenuEntryButton id="download-metadata-open">
          Download Metadata
        </MenuEntryButton>
      </SheetTrigger>

      <SheetContent>
        <HotkeyLayer
          id="download-metadata"
          handlers={{
            BACK: {
              handler: () => setOpen(false),
            },
            MENU: {
              handler: () => {
                downloadMetadata({});
                setOpen(false);
              },
            },
          }}
        >
          <SheetHeader>
            <SheetTitle>Download Metadata</SheetTitle>
            <SheetDescription>Update your library metadata</SheetDescription>
          </SheetHeader>

          <FocusContainer
            opts={{
              focusKey: "download-metadata-menu",
              initialFocus: true,
              isFocusBoundary: true,
            }}
          >
            <SheetFooter className="px-2">
              <SheetClose asChild>
                <HotkeyButton
                  focusOpts={{ focusKey: "download-metadata-menu-close" }}
                  hotkey="BACK"
                >
                  back
                </HotkeyButton>
              </SheetClose>

              <HotkeyButton
                hotkey="MENU"
                focusOpts={{ focusKey: "download-metadata-menu-confirm" }}
                onClick={() => {
                  downloadMetadata({});
                  setOpen(false);
                }}
              >
                Download
              </HotkeyButton>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}
