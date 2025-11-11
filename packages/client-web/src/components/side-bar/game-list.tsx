import { useInstallationIndex } from "@/providers/installation-index";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { Skeleton } from "@retrom/ui/components/skeleton";
import { cn } from "@retrom/ui/lib/utils";
import { useParams } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef } from "react";
import { useFilterAndSort } from "./filter-sort-context";
import { GameItem } from "./game-item";
import { useSidebarMetadataContext } from "./metadata-context";
import { filterName, sortGames } from "./utils";

export function GameList() {
  const { games: allGames } = useSidebarMetadataContext();

  const { installations } = useInstallationIndex();
  const { gameSortKey, filters, gameSortDirection, groupByInstallationStatus } =
    useFilterAndSort();

  const games = useMemo(() => {
    const games =
      allGames?.filter((game) => filterName(game, filters.name)) ?? [];

    games.sort((a, b) => sortGames(a, b, gameSortKey, gameSortDirection));

    if (groupByInstallationStatus) {
      games.sort((a, b) => {
        const aInstalled = installations[a.id] === InstallationStatus.INSTALLED;

        const bInstalled = installations[b.id] === InstallationStatus.INSTALLED;

        if (aInstalled && !bInstalled) {
          return -1;
        }

        if (!aInstalled && bInstalled) {
          return 1;
        }

        return 0;
      });
    }

    return games;
  }, [
    allGames,
    filters.name,
    gameSortDirection,
    gameSortKey,
    groupByInstallationStatus,
    installations,
  ]);

  if (allGames === undefined) {
    return <Skeleton className="w-full h-10 my-2" />;
  }

  return games.length ? (
    <VirtualizedGameList games={games} />
  ) : (
    <div className="grid place-items-center pt-4">
      <p className="font-medium text-muted-foreground italic">
        There are no games here...
      </p>
    </div>
  );
}

function VirtualizedGameList(props: { games: Game[] }) {
  const { games } = props;
  const { gameId: currentGameId } = useParams({ strict: false });
  const virtualizerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: games.length,
    getScrollElement: () => virtualizerRef.current,
    estimateSize: () => 36,
  });

  useEffect(() => {
    const currentIndex = games.findIndex(
      (game) => game.id.toString() === currentGameId,
    );

    if (currentIndex >= 0) {
      virtualizerRef.current?.scrollIntoView({
        block: "center",
      });

      rowVirtualizer.scrollToIndex(currentIndex, {
        align: "center",
        behavior: "auto",
      });
    }
  }, [currentGameId, games, rowVirtualizer]);

  return (
    <ScrollArea
      ref={virtualizerRef}
      className="flex flex-col max-h-[50cqh] bg-[rgba(255,255,255,0.035)]"
      type="always"
    >
      <ul
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
        className={cn("relative")}
      >
        {rowVirtualizer.getVirtualItems().map((item) => {
          const game = games[item.index];

          return (
            <span
              key={item.index}
              style={{
                height: `${item.size}px`,
                transform: `translateY(${item.start}px)`,
              }}
              className={cn("absolute top-0 left-0 w-full")}
            >
              <GameItem game={game} />
            </span>
          );
        })}
      </ul>
    </ScrollArea>
  );
}
