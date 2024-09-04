import { cn } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";

export function Description() {
  const { gameMetadata } = useGameDetail();

  return (
    <p className={cn("text-foreground/90")}>
      {gameMetadata?.description || "No description available."}
    </p>
  );
}
