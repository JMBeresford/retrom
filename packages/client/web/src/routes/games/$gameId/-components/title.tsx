import { cn, getFileStub } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";

export function Title() {
  const { game, gameMetadata } = useGameDetail();

  const name = gameMetadata?.name || getFileStub(game.path);
  const titleSize = (name?.length ?? 0) > 20 ? "text-7xl" : "text-9xl";

  return (
    <h1 className={cn("font-black pb-4 pr-4 text-foreground/95", titleSize)}>
      {name}
    </h1>
  );
}
