import { MenubarItem } from "@/components/ui/menubar";
import { Link } from "@tanstack/react-router";

export function FullscreenMenuItem() {
  return (
    <MenubarItem asChild>
      <Link to="/fullscreen">Fullscreen Mode</Link>
    </MenubarItem>
  );
}
