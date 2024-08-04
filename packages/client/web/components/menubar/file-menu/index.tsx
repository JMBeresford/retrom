import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
} from "@/components/ui/menubar";
import { ConfigMenuItem } from "./config-menu-item";

export async function FileMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        File
      </MenubarTrigger>

      <MenubarContent>
        <ConfigMenuItem />
      </MenubarContent>
    </MenubarMenu>
  );
}
