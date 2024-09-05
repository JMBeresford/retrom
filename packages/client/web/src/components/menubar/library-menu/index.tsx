import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
  MenubarSeparator,
  MenubarItem,
} from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function LibraryMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Library
      </MenubarTrigger>

      <MenubarContent>
        <MenubarItem asChild>
          <Link search={{ updateLibraryModal: { open: true } }}>
            Update Library
          </Link>
        </MenubarItem>

        <MenubarItem asChild>
          <Link search={{ downloadMetadataModal: { open: true } }}>
            Download Metadata
          </Link>
        </MenubarItem>

        <MenubarSeparator />

        <MenubarItem asChild>
          <Link
            className="text-destructive-text"
            search={{ deleteLibraryModal: { open: true } }}
          >
            Delete Library
          </Link>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
