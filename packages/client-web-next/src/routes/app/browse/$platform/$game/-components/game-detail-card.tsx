import { cn } from "@retrom/ui-next/lib/utils";
import type { HTMLAttributes } from "react";

export type GameDetailCardProps = HTMLAttributes<HTMLDivElement>;

export function GameDetailCard({ className, ...props }: GameDetailCardProps) {
  return (
    <div
      className={cn(
        "shadow-lg rounded-md border p-4 bg-background/30",
        className,
      )}
      {...props}
    />
  );
}
