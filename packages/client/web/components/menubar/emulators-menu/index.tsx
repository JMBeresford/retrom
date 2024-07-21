import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
} from "@/components/ui/menubar";
import { ManageEmulatorsMenuItem } from "./manage-emulators";
import { ManageProfilesMenuItem } from "./manage-profiles";
import { IS_DESKTOP } from "@/lib/env";

export async function EmulatorsMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Emulators
      </MenubarTrigger>

      <MenubarContent>
        <ManageEmulatorsMenuItem />
        {IS_DESKTOP ? <ManageProfilesMenuItem /> : null}
      </MenubarContent>
    </MenubarMenu>
  );
}
