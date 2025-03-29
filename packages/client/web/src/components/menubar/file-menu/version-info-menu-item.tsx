import { MenubarItem } from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function VersionInfoMenuItem() {
  return (
    <MenubarItem asChild>
      <Link to="." search={{ versionInfoModal: { open: true } }}>
        Version Info
      </Link>
    </MenubarItem>
  );
}
