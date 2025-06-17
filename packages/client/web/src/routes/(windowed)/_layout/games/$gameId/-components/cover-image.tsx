import { cn, getFileStub, Image } from "@/lib/utils";
import logo from "@/assets/img/LogoLong-NoBackground.png";
import { useGameDetail } from "@/providers/game-details";

export function CoverImage() {
  const { game, gameMetadata } = useGameDetail();

  const name = gameMetadata?.name || getFileStub(game.path);

  return (
    <div
      className={cn(
        "relative border w-fit sm:min-w-full rounded-t-lg overflow-hidden",
        "min-h-[250px]",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 row-start-1 col-start-1",
          "grid place-items-center z-[-1] text-center px-6 py-16",
          "bg-gradient-to-t from-background/80 to-secondary/80",
        )}
      >
        <Image src={logo} alt="Retrom Logo" className="" />
      </div>

      {gameMetadata?.coverUrl && (
        <div>
          <Image
            srcSet={gameMetadata.coverUrl}
            alt={name}
            className={cn(
              "row-start-1 col-start-1",
              "object-cover min-w-full min-h-full",
              "",
            )}
          />
        </div>
      )}
    </div>
  );
}
