import { MenubarItem } from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function ConfigMenuItem() {
  return (
    <MenubarItem onSelect={(e) => e.preventDefault()}>
      <Link search={{ setupModal: { open: true } }}>Connect To Server</Link>
    </MenubarItem>
  );
}
