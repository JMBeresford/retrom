import { MenubarItem } from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function CheckForUpdateMenuItem() {
  return (
    <MenubarItem asChild>
      <Link search={{ checkForUpdateModal: { open: true } }}>
        Check for updates
      </Link>
    </MenubarItem>
  );
}
