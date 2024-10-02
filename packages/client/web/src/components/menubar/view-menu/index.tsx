import {
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { FullscreenMenuItem } from "./fullscreen-menu-item";

export function ViewMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        View
      </MenubarTrigger>

      <MenubarContent>
        <FullscreenMenuItem />
      </MenubarContent>
    </MenubarMenu>
  );
}
