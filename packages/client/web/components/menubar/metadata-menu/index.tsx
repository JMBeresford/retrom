import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
} from "@/components/ui/menubar";
import { MatchPlatformsMenuItem } from "./match-platforms-menu-item";

export async function MetadataMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Metadata
      </MenubarTrigger>

      <MenubarContent>
        <MatchPlatformsMenuItem />
      </MenubarContent>
    </MenubarMenu>
  );
}
