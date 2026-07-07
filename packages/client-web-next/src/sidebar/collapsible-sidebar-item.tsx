import { useSidebar } from "@retrom/ui-next/hooks/use-sidebar";
import { cn } from "@retrom/ui-next/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type CollapsibleSidebarItemProps = ComponentPropsWithoutRef<"div"> & {
  expanded: ReactNode;
  collapsed: ReactNode;
};

export function CollapsibleSidebarItem({
  expanded,
  collapsed,
  className,
  ...props
}: CollapsibleSidebarItemProps) {
  const { open } = useSidebar();

  return (
    <div className={cn(`relative w-full h-full`, className)} {...props}>
      <div
        className={cn(
          "absolute bottom-0 left-0 fade-in fade-out",
          open
            ? "animate-out fill-mode-forwards poinr-events-none touch-none"
            : "animate-in delay-300 fill-mode-backwards",
        )}
      >
        {collapsed}
      </div>

      <div
        className={cn(
          "fade-out fade-in overflow-hidden",
          open
            ? "delay-300 animate-in fill-mode-backwards"
            : "animate-out fill-mode-forwards pointer-events-none touch-none",
        )}
      >
        {expanded}
      </div>
    </div>
  );
}
