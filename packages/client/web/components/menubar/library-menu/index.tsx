import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { UpdateLibraryMenuItem } from "./update-library-menu-item";
import { UpdateMetadataMenuItem } from "./update-library-metadata-menu-item";
import { DeleteLibraryMenuItem } from "./delete-library-menu-item";
import {
  deleteLibrary,
  updateLibrary,
  updateLibraryMetadata,
} from "@/actions/grpc/library";

export async function LibraryMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Library
      </MenubarTrigger>

      <MenubarContent>
        <UpdateLibraryMenuItem handler={updateLibrary} />

        <UpdateMetadataMenuItem handler={updateLibraryMetadata} />

        <MenubarSeparator />

        <DeleteLibraryMenuItem handler={deleteLibrary} />
      </MenubarContent>
    </MenubarMenu>
  );
}
