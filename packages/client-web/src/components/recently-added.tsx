import { ScrollArea, ScrollBar } from "@retrom/ui/components/scroll-area";
import { Skeleton } from "@retrom/ui/components/skeleton";
import { timestampToDate } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useGames } from "@/queries/useGames";
import { useMemo } from "react";
import { GameList, GameWithMetadata } from "./game-list";

export function RecentlyAdded() {
  const { data, status } = useGames({ request: { withMetadata: true } });

  const gamesByDate: GameWithMetadata[] =
    useMemo(
      () =>
        data?.games
          .map((game) => ({
            ...game,
            metadata: data.metadata?.find((meta) => meta.gameId === game.id),
          }))
          .sort((a, b) => {
            const aTime = timestampToDate(a.createdAt).getTime();
            const bTime = timestampToDate(b.createdAt).getTime();

            return bTime - aTime;
          })
          .slice(0, 20),
      [data],
    ) ?? [];

  return (
    <div className="w-full">
      <h1 className="font-black text-3xl mb-5 px-5 sm:px-0">Recently Added</h1>

      <div className="relative flex w-full">
        <ScrollArea className="w-1 flex-1 pb-4 overflow-x-auto">
          {status === "pending" ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : status === "error" ? (
            <div className="h-64 w-full grid place-items-center bg-muted/50 text-muted-foreground">
              Could not load game data
            </div>
          ) : gamesByDate.length ? (
            <GameList games={gamesByDate} />
          ) : (
            <div className="h-64 w-full grid place-items-center bg-muted/50 text-muted-foreground">
              No games found
            </div>
          )}

          <ScrollBar orientation="horizontal" className="z-30" />
        </ScrollArea>
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background",
            "z-20 pointer-events-none touch-none",
            "hidden sm:block",
          )}
        />
      </div>
    </div>
  );
}
