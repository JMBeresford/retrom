import {
  MenubarItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "@/components/ui/menubar";
import { openInstallationDir } from "retrom-plugin-installer-api";

export function LocationsMenuItem() {
  return (
    <MenubarSub>
      <MenubarSubTrigger>Locations</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem onSelect={() => void openInstallationDir()}>
          Open Installation Directory
        </MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  );
}
