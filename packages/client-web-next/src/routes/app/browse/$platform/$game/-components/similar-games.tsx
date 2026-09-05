import { cn } from "@retrom/ui-next/lib/utils";
import { Skeleton } from "@retrom/ui-next/components/skeleton";
import { ScrollArea, ScrollBar } from "@retrom/ui-next/components/scroll-area";
import { GameCover } from "./game-cover";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { HTMLAttributes } from "react";
import { useListGameMetadata } from "@/data/metadata/use-list-game-metadata";

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
    <div
      className={cn(
        "w-full flex flex-col justify-between gap-2",
        "shadow-lg rounded-md border p-4 pb-0 bg-background/30",
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
          <ScrollArea className="w-full h-full overflow-hidden pb-4">
            <div className="flex h-full gap-4">
              {similarGameMetasQuery.data.map((similarGameMeta) => (
                <GameCover
                  key={similarGameMeta.id}
                  metadata={similarGameMeta}
                  className={cn(
                    "h-30 aspect-3/4 shrink-0",
                    "*:scale-100 hover:*:scale-105 *:transition-transform",
                  )}
                />
              ))}
            </div>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
