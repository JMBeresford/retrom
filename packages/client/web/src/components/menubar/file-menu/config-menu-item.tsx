import { MenubarItem } from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function ConfigMenuItem() {
  return (
    <MenubarItem asChild>
      <Link search={{ configModal: { open: true } }}>Configuration</Link>
    </MenubarItem>
  );
}
