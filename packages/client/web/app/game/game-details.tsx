"use client";

import { cn, getFileStub, Image } from "@/lib/utils";
import { Actions } from "./actions";
import { useGameDetail } from "./game-context";
import { Genres } from "./genres";
import { Media } from "./media";
import { Links } from "./links";
import { SimilarGames } from "./similar_games";
import { GameFiles } from "./game-files";

export function GameDetails() {
  const { game, gameMetadata } = useGameDetail();

  const name = gameMetadata?.name || getFileStub(game.path);
  const bgUrl = gameMetadata?.backgroundUrl ?? gameMetadata?.coverUrl;
  const titleSize = (name?.length ?? 0) > 20 ? "text-7xl" : "text-9xl";

  return (
    <div className={cn("relative grid grid-cols-[300px_1fr] gap-8")}>
      <div
        className={cn(
          "col-span-2 fixed top-0 left-0 right-0 h-[90dvh]  z-[-1] overflow-hidden bg-secondary",
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

      <div id="left" className="flex flex-col gap-5">
        <div className={cn("flex flex-col relative")}>
          <div
            className={cn(
              "relative rounded-t-lg border min-w-full aspect-[3/4] overflow-hidden",
            )}
          >
            <div className="absolute inset-0 grid place-items-center z-[-1] bg-muted">
              <h5 className="font-semibold text-lg">{name}</h5>
            </div>
            {gameMetadata?.coverUrl && (
              <div>
                <Image
                  src={gameMetadata.coverUrl}
                  alt={name}
                  className="object-cover min-w-full min-h-full"
                />
              </div>
            )}
          </div>

          <Actions />
        </div>

        <Genres />
      </div>

      <div id="right" className="pr-5">
        <div className="pb-5">
          <h1
            className={cn("font-black pb-4 pr-4 text-foreground/95", titleSize)}
          >
            {name}
          </h1>

          <p className={cn("text-foreground/90")}>
            {gameMetadata?.description || "No description available."}
          </p>
        </div>

        <div
          className={cn(
            `grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] grid-rows-[repeat(auto-fit,minmax(100px,1fr))]`,
            "grid-flow-dense gap-5",
          )}
        >
          <Links />
          <GameFiles />
          <Media />

          <SimilarGames />
        </div>
      </div>
    </div>
  );
}
