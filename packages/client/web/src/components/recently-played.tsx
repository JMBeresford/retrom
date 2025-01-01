import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, timestampToDate } from "@/lib/utils";
import { useGames } from "@/queries/useGames";
import { useMemo } from "react";
import { GameList, GameWithMetadata } from "./game-list";

export function RecentlyPlayed() {
  const { data, status } = useGames({ request: { withMetadata: true } });

  const gamesByPlayedDate: GameWithMetadata[] =
    useMemo(
      () =>
        data?.games
          .map((game) => ({
            ...game,
            metadata: data.metadata?.find((meta) => meta.gameId === game.id),
          }))
          .sort((a, b) => {
            const aTime = timestampToDate(a.metadata?.lastPlayed).getTime();
            const bTime = timestampToDate(b.metadata?.lastPlayed).getTime();

            return bTime - aTime;
          })
          .slice(0, 20),
      [data],
    ) ?? [];

  return (
    <div className="w-full">
      <h1 className="font-black text-3xl mb-5">Recently Played</h1>

      <div className="relative flex w-full">
        <ScrollArea className="w-1 flex-1 pb-4 overflow-x-auto">
          {status === "pending" ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : status === "error" ? (
            <div className="h-64 w-full grid place-items-center bg-muted/50 text-muted-foreground">
              Could not load game data
            </div>
          ) : (
            <GameList games={gamesByPlayedDate} />
          )}

          <ScrollBar orientation="horizontal" className="z-30" />
        </ScrollArea>
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background",
            "z-20 pointer-events-none touch-none",
          )}
        />
      </div>
    </div>
  );
}
