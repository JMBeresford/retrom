import { cn } from "@retrom/ui-next/lib/utils";
import { Link } from "@tanstack/react-router";

export function EmulatorsHeading() {
  return (
    <Link
      to="/app/emulators"
      className={cn(
        "transition-colors",
        "font-heading text-4xl font-bold",
        "hover:text-foreground",
      )}
      inactiveProps={{ className: "text-muted-foreground/50" }}
      activeProps={{ className: "text-foreground" }}
      activeOptions={{ exact: true }}
    >
      Emulators
    </Link>
  );
}
