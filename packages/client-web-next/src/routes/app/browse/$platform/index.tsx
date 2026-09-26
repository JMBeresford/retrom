import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PathHeading } from "../../-components/path-heading";
import { platformHeadingSegments } from "./-components/platform-heading";
import { GameItem } from "./-components/game-item";
import { useListGames } from "@/data/libraries/use-list-games";
import { GameFormDialog } from "@/modals/game-form-dialog/dialog";
import { useGetPlatformMetadata } from "@/data/metadata/use-get-platform-metadata";

export const Route = createFileRoute("/app/browse/$platform/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { platform } = Route.useParams();

  const platformMetadataQuery = useGetPlatformMetadata({
    request: {
      name: `platforms/${platform}/metadata`,
    },
  });

  const gamesQuery = useListGames({
    request: {
      platformIds: [platform],
    },
  });

  const isPending = platformMetadataQuery.isPending || gamesQuery.isPending;
  const isError = platformMetadataQuery.isError || gamesQuery.isError;

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive">
        Error loading platform metadata and/or games list.
      </p>
    );
  }

  const games = gamesQuery.data.games;

  return (
    <>
      <div>
        <PathHeading
          segments={platformHeadingSegments(
            platform,
            platformMetadataQuery.data.title,
          )}
        />

        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mt-4">
          {games.map((game) => (
            <GameItem key={game.id} gameId={game.id} />
          ))}
        </div>
      </div>

      <GameFormDialog />
    </>
  );
}
