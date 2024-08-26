import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { UpdateLibraryMenuItem } from "./update-library-menu-item";
import { DownloadMetadataMenuItem } from "./download-metadata-menu-item";
import { DeleteLibraryMenuItem } from "./delete-library-menu-item";

export async function LibraryMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Library
      </MenubarTrigger>

      <MenubarContent>
        <UpdateLibraryMenuItem />

        <DownloadMetadataMenuItem />

        <MenubarSeparator />

        <DeleteLibraryMenuItem />
      </MenubarContent>
    </MenubarMenu>
  );
}
