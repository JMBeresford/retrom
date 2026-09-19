import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { cn } from "@retrom/ui-next/lib/utils";
import { Separator } from "@retrom/ui-next/components/separator";
import { gameHeadingSegments } from "./-components/game-heading";
import { GameBackground } from "./-components/game-background";
import { GameDates } from "./-components/dates";
import { Launcher, LauncherContextProvider } from "./-components/launcher";
import { GameCover } from "./-components/game-cover";
import { Files } from "./-components/files";
import { Description } from "./-components/description";
import { SimilarGames } from "./-components/similar-games";
import { GameDetailCard } from "./-components/game-detail-card";
import { Media } from "./-components/media";
import { PathHeading } from "@/routes/app/-components/path-heading";
import { useListGameMetadata } from "@/data/metadata/use-list-game-metadata";
import { useListPlatformMetadata } from "@/data/metadata/use-list-platform-metadata";
import { useGetGame } from "@/data/libraries/use-get-game";

export const Route = createFileRoute("/app/browse/$platform/$game/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { game: gameId, platform: platformId } = Route.useParams();

  const gameQuery = useGetGame({
    request: {
      id: gameId,
    },
  });

  const gameMetadataQuery = useListGameMetadata({
    request: {
      gameIds: [gameId],
    },
    options: {
      select: (response) =>
        [...response.metadata].sort((a, b) =>
          b.provider.localeCompare(a.provider),
        ),
    },
  });

  const platformMetadataQuery = useListPlatformMetadata({
    request: {
      platformIds: [platformId],
    },
    options: {
      select: (response) =>
        [...response.metadata].sort((a, b) =>
          b.provider.localeCompare(a.provider),
        ),
    },
  });

  const isPending =
    gameMetadataQuery.isPending ||
    platformMetadataQuery.isPending ||
    gameQuery.isPending;

  const isError =
    gameMetadataQuery.isError ||
    platformMetadataQuery.isError ||
    gameQuery.isError;

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-destructive">Error loading game metadata.</p>;
  }

  const game = gameQuery.data;
  const metadata = gameMetadataQuery.data.at(0);
  const platformMetadata = platformMetadataQuery.data.at(0);

  if (!metadata || !platformMetadata) {
    return (
      <p className="text-destructive">
        No metadata found for game ID: {gameId}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GameBackground metadata={metadata}></GameBackground>
      <PathHeading
        className="mb-4"
        segments={gameHeadingSegments({
          platformName: platformMetadata.name,
          gameName: metadata.name,
          gameId,
        })}
      />

      <div className={cn("w-full flex gap-4")}>
        <div className="flex flex-col gap-2 w-65 shrink-0">
          <GameCover metadata={metadata} />
        </div>

        <LauncherContextProvider>
          <GameDetailCard
            className={cn("w-full flex flex-col justify-between gap-4")}
          >
            <Launcher />
            <Separator />
            <Files />
            <Separator />
            <GameDates game={game} metadata={metadata} className="pb-4" />
          </GameDetailCard>
        </LauncherContextProvider>
      </div>

      <Description metadata={metadata} />
      <Media metadata={metadata} />
      <SimilarGames metadata={metadata} />
    </div>
  );
}
