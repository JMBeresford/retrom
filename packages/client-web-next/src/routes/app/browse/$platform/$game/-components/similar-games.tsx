import { cn } from "@retrom/ui-next/lib/utils";
import { Skeleton } from "@retrom/ui-next/components/skeleton";
import { ScrollArea, ScrollBar } from "@retrom/ui-next/components/scroll-area";
import { Link } from "@tanstack/react-router";
import { GameCover } from "./game-cover";
import { GameDetailCard } from "./game-detail-card";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { HTMLAttributes } from "react";
import { useListGameMetadata } from "@/data/metadata/use-list-game-metadata";
import { useGetGame } from "@/data/libraries/use-get-game";

export type SimilarGamesProps = {
  metadata: GameMetadata;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function SimilarGames({
  metadata,
  className,
  ...props
}: SimilarGamesProps) {
  const similarGameMetasQuery = useListGameMetadata({
    request: {
      gameIds: metadata.similarGames,
    },
    options: {
      select: (response) =>
        response.metadata.filter((m) => !!m.coverUrl).slice(0, 20),
    },
  });

  const isPending = similarGameMetasQuery.isPending;
  const isError = similarGameMetasQuery.isError;

  return (
    <GameDetailCard
      className={cn(
        "w-full flex flex-col justify-between gap-2 pb-1",
        className,
      )}
      {...props}
    >
      <h3 className="font-heading text-lg font-semibold">Similar Games</h3>

      {isPending ? (
        <Skeleton className="w-full h-30" />
      ) : isError ? (
        <p className="text-destructive">Error loading similar games.</p>
      ) : (
        <div className="w-full">
          <ScrollArea className="w-full h-full overflow-hidden pb-3">
            <div className="flex h-full gap-4">
              {similarGameMetasQuery.data.map((similarGameMeta) => (
                <SimilarGameCover
                  key={similarGameMeta.id}
                  metadata={similarGameMeta}
                />
              ))}
            </div>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </GameDetailCard>
  );
}

function SimilarGameCover({ metadata }: { metadata: GameMetadata }) {
  const gameQuery = useGetGame({
    request: {
      id: metadata.game,
    },
  });

  if (gameQuery.isPending) {
    return <Skeleton className="h-30 aspect-3/4 shrink-0" />;
  }

  if (gameQuery.isError) {
    return;
  }

  const gameId = gameQuery.data.id;
  const platformId = gameQuery.data.platforms.at(0);

  if (!platformId) {
    return;
  }

  return (
    <Link
      to="/app/browse/$platform/$game"
      params={{ platform: platformId, game: gameId }}
    >
      <GameCover
        metadata={metadata}
        className={cn(
          "h-30 aspect-3/4 shrink-0",
          "*:scale-100 hover:*:scale-105 *:transition-transform",
        )}
      />
    </Link>
  );
}
