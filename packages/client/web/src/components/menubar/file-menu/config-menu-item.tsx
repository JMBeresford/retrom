import { MenubarItem } from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function ConfigMenuItem() {
  return (
    <MenubarItem asChild>
      <Link search={{ setupModal: { open: true } }}>Connect To Server</Link>
    </MenubarItem>
  );
}
