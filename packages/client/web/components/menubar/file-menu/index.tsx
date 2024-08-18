import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { ConfigMenuItem } from "./config-menu-item";
import { IS_DESKTOP } from "@/lib/env";
import { CloseMenuItem } from "./close-menu-item";

export async function FileMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        File
      </MenubarTrigger>

      <MenubarContent>
        <ConfigMenuItem />

        {IS_DESKTOP ? (
          <>
            <MenubarSeparator className="bg-border/50 w-[95%] px-2 mx-auto" />

            <CloseMenuItem />
          </>
        ) : null}
      </MenubarContent>
    </MenubarMenu>
  );
}
