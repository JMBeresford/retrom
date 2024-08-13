"use client";

import { cn } from "@/lib/utils";
import { useGameDetail } from "../game-details-context";

export function Description() {
  const { gameMetadata } = useGameDetail();

  return (
    <p className={cn("text-foreground/90")}>
      {gameMetadata?.description || "No description available."}
    </p>
  );
}
