import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function EmulatorsMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Emulators
      </MenubarTrigger>

      <MenubarContent>
        <MenubarItem asChild>
          <Link search={{ manageEmulatorsModal: { open: true } }}>
            Manage Emulators
          </Link>
        </MenubarItem>

        <MenubarItem asChild>
          <Link search={{ manageEmulatorProfilesModal: { open: true } }}>
            Manage Profiles
          </Link>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
