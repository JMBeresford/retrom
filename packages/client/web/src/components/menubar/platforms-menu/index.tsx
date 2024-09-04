import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
} from "@/components/ui/menubar";
import { MatchPlatformsMenuItem } from "./match-platforms-menu-item";
import { DefaultProfilesMenuItem } from "./default-profiles-menu-item";
import { DesktopOnly } from "@/lib/env";

export function PlatformsMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Platforms
      </MenubarTrigger>

      <MenubarContent>
        <MatchPlatformsMenuItem />
        <DesktopOnly>
          <DefaultProfilesMenuItem />
        </DesktopOnly>
      </MenubarContent>
    </MenubarMenu>
  );
}
