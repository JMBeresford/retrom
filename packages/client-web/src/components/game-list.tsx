import { GameMetadata } from "@retrom/codegen/retrom/models/metadata_pb";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { getFileName, getFileStub, Image } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { ActionButton } from "../components/action-button";
import { GameDetailProvider, useGameDetail } from "@/providers/game-details";
import { Link } from "@tanstack/react-router";
import { useMediaQuery } from "@/utils/use-media-query";
import { createUrl, usePublicUrl } from "@/utils/urls";
import { useMemo } from "react";
import { StorageType } from "@retrom/codegen/retrom/server/config_pb";
import { Skeleton } from "@retrom/ui/components/skeleton";

export type GameWithMetadata = Game & { metadata?: GameMetadata };

export function GameList(props: { games: GameWithMetadata[] }) {
  return (
    <div
      className={cn(
        "flex sm:grid grid-rows-2 grid-flow-col-dense auto-cols-max pr-20",
        "pl-5 sm:pl-0",
      )}
    >
      {props.games.map((game) => {
        return (
          <GameDetailProvider
            key={game.id}
            gameId={game.id}
            loadingComponent={
              <Skeleton className="aspect-video h-[24rem] mx-5 row-span-2" />
            }
          >
            <GameItem />
          </GameDetailProvider>
        );
      })}
    </div>
  );
}

function GameItem() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const publicUrl = usePublicUrl();
  const { game, gameMetadata, extraMetadata } = useGameDetail();

  const bgUrl = useMemo(() => {
    const localPath = extraMetadata?.mediaPaths?.backgroundUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.backgroundUrl;
  }, [publicUrl, gameMetadata, extraMetadata]);

  const coverUrl = useMemo(() => {
    const localPath = extraMetadata?.mediaPaths?.coverUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.coverUrl;
  }, [publicUrl, gameMetadata, extraMetadata]);

  const played = gameMetadata?.minutesPlayed;
  const playedRender = played
    ? played > 60
      ? `Played for ${Math.floor(played / 60)}h ${played % 60}m`
      : `Played for ${played}m`
    : "Not played yet";

  const image = isMobile ? (coverUrl ?? bgUrl) : (bgUrl ?? coverUrl);

  const gameName =
    gameMetadata?.name ??
    (game.storageType === StorageType.SINGLE_FILE_GAME
      ? getFileStub(game.path)
      : getFileName(game.path));

  return (
    <div
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
              "absolute left-3 bottom-3 w-[90%] overflow-hidden text-ellipsis",
            )}
          >
            <h3 className="whitespace-nowrap text-lg font-bold overflow-hidden text-ellipsis">
              {gameName}
            </h3>

            <h5 className="text-sm text-muted-foreground mb-2">
              {playedRender}
            </h5>

            <div
              className={cn(
                "rounded-md overflow-hidden w-fit pointer-events-auto touch-auto z-50",
                "hidden sm:block",
              )}
            >
              <ActionButton
                size="sm"
                className='text-md min-w-[100px] [&_div[role="progressbar"]_>_*]:bg-primary-foreground'
              />
            </div>
          </div>
        </div>

        <GameImage game={game} name={gameName} image={image} />
      </div>
    </div>
  );
}

function GameImage(props: { game: Game; name: string; image?: string }) {
  const { game, name, image } = props;

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
