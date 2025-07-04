import { cn, getFileStub } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";

export function Title() {
  const { game, gameMetadata } = useGameDetail();

  const name = gameMetadata?.name || getFileStub(game.path);
  const titleSize = (name?.length ?? 0) > 20 ? "text-7xl" : "text-9xl";
  const mobileTitleSize = (name?.length ?? 0) > 20 ? "text-3xl" : "text-5xl";

  return (
    <h1
      className={cn(
        "font-black pb-4 sm:pr-4 text-foreground/95 ",
        mobileTitleSize,
        `sm:${titleSize}`,
      )}
    >
      {name}
    </h1>
  );
}
