import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { DesktopOnly } from "@/lib/env";
import { Link } from "@tanstack/react-router";

export function PlatformsMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Platforms
      </MenubarTrigger>

      <MenubarContent>
        <MenubarItem asChild>
          <Link search={{ matchPlatformsModal: { open: true } }}>
            Match Platforms
          </Link>
        </MenubarItem>

        <DesktopOnly>
          <MenubarItem asChild>
            <Link search={{ defaultProfilesModal: { open: true } }}>
              Default Emulator Profiles
            </Link>
          </MenubarItem>
        </DesktopOnly>
      </MenubarContent>
    </MenubarMenu>
  );
}
