import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { SetupMenuItem } from "./setup-menu-item";
import { CloseMenuItem } from "./close-menu-item";
import { CheckForUpdateMenuItem } from "./check-for-update-menu-item";
import { DesktopOnly } from "@/lib/env";
import { VersionInfoMenuItem } from "./version-info-menu-item";
import { ConfigMenuItem } from "./config-menu-item";
import { LocationsMenuItem } from "./locations-menu-item";

export function FileMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        File
      </MenubarTrigger>

      <MenubarContent>
        <ConfigMenuItem />
        <MenubarSeparator />
        <VersionInfoMenuItem />

        <DesktopOnly>
          <CheckForUpdateMenuItem />
          <MenubarSeparator />
          <LocationsMenuItem />
          <MenubarSeparator />
          <SetupMenuItem />
          <CloseMenuItem />
        </DesktopOnly>
      </MenubarContent>
    </MenubarMenu>
  );
}
