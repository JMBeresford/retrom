import { getFileStub, Image } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useGameDetail } from "@/providers/game-details";

export function BackgroundImage() {
  const { game, gameMetadata } = useGameDetail();

  const name = gameMetadata?.name || getFileStub(game.path);
  const bgUrl = gameMetadata?.backgroundUrl ?? gameMetadata?.coverUrl;

  return (
    <div
      className={cn(
        "col-span-2 fixed top-0 left-0 right-0 h-[100dvh] z-[-1] overflow-hidden bg-secondary",
      )}
    >
      {bgUrl && (
        <Image
          src={bgUrl}
          alt={name ?? "Game Background"}
          className="object-cover absolute min-w-full min-h-full max-w-full max-h-full blur-xl"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background to-background/70"></div>
    </div>
  );
}
