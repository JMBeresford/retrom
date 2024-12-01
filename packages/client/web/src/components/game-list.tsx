import { Game } from "@/generated/retrom/models/games";
import { GameMetadata } from "@/generated/retrom/models/metadata";
import { cn, getFileStub, Image } from "@/lib/utils";
import { ActionButton } from "../components/action-button";
import { GameDetailProvider } from "@/providers/game-details";
import { Link } from "@tanstack/react-router";

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
        const name = game.metadata?.name ?? getFileStub(game.path);

        return (
          <div
            key={game.id}
            className={cn(
              "aspect-video h-[12rem] max-h-[12rem] p-2",
              image === coverUrl &&
                "row-span-2 h-[24rem] max-h-[24rem] aspect-[3/4]",
              "first:row-span-2 first:h-[24rem] first:max-h-[24rem] first:pl-0",
            )}
          >
            <div
              className={cn(
                "relative w-full h-full group",
                "rounded-lg overflow-hidden",
                !image && "border",
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

                  <GameDetailProvider gameId={game.id}>
                    <div className="rounded-md overflow-hidden w-fit pointer-events-auto touch-auto z-50">
                      <ActionButton
                        size="sm"
                        className='text-md min-w-[100px] [&_div[role="progressbar"]_>_*]:bg-primary-foreground'
                        game={game}
                      />
                    </div>
                  </GameDetailProvider>
                </div>
              </div>

              <Link
                to={"/games/$gameId"}
                params={{ gameId: game.id.toString() }}
                className="cursor-pointer"
              >
                <div className="relative w-full h-full z-[-1] bg-muted">
                  <div className="absolute inset-0 p-4 text-center grid place-items-center z-[-2]">
                    <h3 className="text-2xl font-black text-muted-foreground/50">
                      {name}
                    </h3>
                  </div>
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      className={cn(
                        "object-cover h-full w-full rounded-lg mx-auto z-[-1] bg-transparent",
                        "scale-100 group-hover:scale-[110%] transition-transform",
                      )}
                    />
                  ) : null}
                </div>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
