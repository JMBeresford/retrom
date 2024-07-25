import { Game } from "@/generated/retrom/models/games";
import { GameMetadata } from "@/generated/retrom/models/metadata";
import { cn, Image } from "@/lib/utils";
import Link from "next/link";

export type GameWithMetadata = Game & { metadata?: GameMetadata };

export function GameList(props: { games: GameWithMetadata[] }) {
  return (
    <div className="grid grid-rows-2 grid-flow-col-dense auto-cols-max pr-20">
      {props.games.map((game) => {
        const bgUrl = game.metadata?.backgroundUrl;
        const coverUrl = game.metadata?.coverUrl;

        const image = bgUrl ?? coverUrl;

        return (
          <Link
            key={game.id}
            href={`/game/?gameId=${game.id}`}
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
                  "absolute inset-0 bg-gradient-to-t from-card",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                )}
              >
                <div className="absolute left-5 bottom-5 w-[90%] overflow-hidden overflow-ellipsis">
                  <h3 className="whitespace-nowrap inline text-lg font-bold">
                    {game.metadata?.name}
                  </h3>
                </div>
              </div>
              <div className="w-full h-full z-[-1]">
                <Image
                  src={image}
                  alt={game.metadata?.name}
                  className="object-cover h-full w-full rounded-lg mx-auto z-[-1]"
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
