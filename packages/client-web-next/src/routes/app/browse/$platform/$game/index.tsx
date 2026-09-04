import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { gameHeadingSegments } from "./-components/game-heading";
import { PathHeading } from "@/routes/app/-components/path-heading";
import { useListGameMetadata } from "@/data/metadata/use-list-game-metadata";
import { useListPlatformMetadata } from "@/data/metadata/use-list-platform-metadata";

export const Route = createFileRoute("/app/browse/$platform/$game/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { game: gameId, platform: platformId } = Route.useParams();

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
    gameMetadataQuery.isPending || platformMetadataQuery.isPending;
  const isError = gameMetadataQuery.isError || platformMetadataQuery.isError;

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
    <div>
      <PathHeading
        segments={gameHeadingSegments({
          platformName: platformMetadata.name,
          gameName: metadata.name,
          gameId,
        })}
      />
    </div>
  );
}
