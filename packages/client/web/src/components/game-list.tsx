import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { GameMetadata } from "@retrom/codegen/retrom/models/metadata_pb";
import { cn, getFileStub, Image } from "@/lib/utils";
import { ActionButton } from "../components/action-button";
import { GameDetailProvider } from "@/providers/game-details";
import { Link } from "@tanstack/react-router";
import { useMediaQuery } from "@/utils/use-media-query";

export type GameWithMetadata = Game & { metadata?: GameMetadata };

export function GameList(props: { games: GameWithMetadata[] }) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div
      className={cn(
        "flex sm:grid grid-rows-2 grid-flow-col-dense auto-cols-max pr-20",
        "pl-5 sm:pl-0",
      )}
    >
      {props.games.map((game) => {
        const bgUrl = game.metadata?.backgroundUrl;
        const coverUrl = game.metadata?.coverUrl;

        const played = game.metadata?.minutesPlayed;
        const playedRender = played
          ? played > 60
            ? `Played for ${Math.floor(played / 60)}h ${played % 60}m`
            : `Played for ${played}m`
          : "Not played yet";

        const image = isMobile ? (coverUrl ?? bgUrl) : (bgUrl ?? coverUrl);

        return (
          <div
            key={game.id}
            className={cn(
              "aspect-video h-[12rem] max-h-[12rem] p-2",
              (image === coverUrl || isMobile) &&
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
                  "sm:opacity-0 group-hover:opacity-100 transition-opacity",
                )}
              >
                <div
                  className={cn(
                    "absolute left-3 bottom-3 w-[90%] overflow-hidden overflow-ellipsis",
                  )}
                >
                  <h3 className="whitespace-nowrap text-lg font-bold overflow-hidden overflow-ellipsis">
                    {game.metadata?.name || getFileStub(game.path)}
                  </h3>

                  <h5 className="text-sm text-muted-foreground mb-2">
                    {playedRender}
                  </h5>

                  <GameDetailProvider gameId={game.id}>
                    <div
                      className={cn(
                        "rounded-md overflow-hidden w-fit pointer-events-auto touch-auto z-50",
                        "hidden sm:block",
                      )}
                    >
                      <ActionButton
                        size="sm"
                        className='text-md min-w-[100px] [&_div[role="progressbar"]_>_*]:bg-primary-foreground'
                        game={game}
                      />
                    </div>
                  </GameDetailProvider>
                </div>
              </div>

              <GameImage game={game} image={image} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GameImage(props: { game: GameWithMetadata; image?: string }) {
  const { game, image } = props;
  const name = game.metadata?.name ?? getFileStub(game.path);

  return (
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
  );
}
