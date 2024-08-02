"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, timestampToDate } from "@/lib/utils";
import { useGames } from "@/queries/useGames";
import { useMemo } from "react";
import { GameList, GameWithMetadata } from "./game-list";

export function RecentlyAdded() {
  const { data, status } = useGames({ withMetadata: true });

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

  if (status === "error") {
    return <div>Error</div>;
  }

  return (
    <div className="w-full">
      <h1 className="font-black text-3xl mb-5">Recently Added</h1>

      <div className="relative flex w-full">
        <ScrollArea className="w-1 flex-1 pb-2 overflow-x-auto">
          {status === "pending" ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <GameList games={gamesByDate} />
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
