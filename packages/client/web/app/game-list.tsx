import { Game } from "@/generated/retrom/models/games";
import { GameMetadata } from "@/generated/retrom/models/metadata";
import { cn, Image, timestampToDate } from "@/lib/utils";
import Link from "next/link";
import { ActionButton } from "./game/action-button";
import { GameDetailProvider } from "./game/game-context";

export type GameWithMetadata = Game & { metadata?: GameMetadata };

export function GameList(props: { games: GameWithMetadata[] }) {
  return (
    <div className="grid grid-rows-2 grid-flow-col-dense auto-cols-max pr-20">
      {props.games.map((game) => {
        const bgUrl = game.metadata?.backgroundUrl;
        const coverUrl = game.metadata?.coverUrl;

        const played = game.metadata?.minutesPlayed;
        const playedRender = played
          ? played > 60
            ? `Played for ${Math.floor(played / 60)}h ${played % 60}m`
            : `Played for ${played}m`
          : "Not played yet";

        const image = bgUrl ?? coverUrl;

        return (
          <div
            key={game.id}
            className={cn(
              "aspect-video h-[12rem] p-2",
              image === coverUrl && "row-span-2 h-full aspect-[3/4]",
              "first:row-span-2 first:h-[24rem] first:pl-0",
            )}
          >
            <div
              className={cn(
                "relative w-full h-full group",
                "rounded-lg border border-border overflow-hidden",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-card to-card/20 pointer-events-none touch-none",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                )}
              >
                <div
                  className={cn(
                    "absolute left-3 bottom-3 w-[90%] overflow-hidden overflow-ellipsis",
                  )}
                >
                  <h3 className="whitespace-nowrap text-lg font-bold">
                    {game.metadata?.name}
                  </h3>

                  <h5 className="text-sm text-muted-foreground mb-2">
                    {playedRender}
                  </h5>

                  <GameDetailProvider game={game}>
                    <div className="rounded-md overflow-hidden w-fit pointer-events-auto touch-auto z-50">
                      <ActionButton size="sm" className="text-md" game={game} />
                    </div>
                  </GameDetailProvider>
                </div>
              </div>
              <Link
                href={`/game/?gameId=${game.id}`}
                className="cursor-pointer"
              >
                <div className="w-full h-full z-[-1]">
                  <Image
                    src={image}
                    alt=""
                    className="object-cover h-full w-full rounded-lg mx-auto z-[-1]"
                  />
                </div>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
