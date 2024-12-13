import { MenubarItem } from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function SetupMenuItem() {
  return (
    <MenubarItem asChild>
      <Link search={{ setupModal: { open: true } }}>Setup</Link>
    </MenubarItem>
  );
}
