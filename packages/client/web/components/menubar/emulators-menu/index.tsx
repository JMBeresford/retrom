import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
} from "@/components/ui/menubar";
import { ManageEmulatorsMenuItem } from "./manage-emulators";
import { ManageProfilesMenuItem } from "./manage-profiles";

export async function EmulatorsMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Emulators
      </MenubarTrigger>

      <MenubarContent>
        <ManageEmulatorsMenuItem />

        <ManageProfilesMenuItem />
      </MenubarContent>
    </MenubarMenu>
  );
}
