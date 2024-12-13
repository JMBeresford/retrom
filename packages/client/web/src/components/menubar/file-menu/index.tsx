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

export function FileMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        File
      </MenubarTrigger>

      <MenubarContent>
        <DesktopOnly>
          <SetupMenuItem />
          <CheckForUpdateMenuItem />
        </DesktopOnly>

        <ConfigMenuItem />
        <VersionInfoMenuItem />

        <DesktopOnly>
          <MenubarSeparator className="bg-border/50 w-[95%] px-2 mx-auto" />

          <CloseMenuItem />
        </DesktopOnly>
      </MenubarContent>
    </MenubarMenu>
  );
}
