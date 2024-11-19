import { Image, cn, getFileName, getFileStub } from "@/lib/utils";
import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePlatforms } from "@/queries/usePlatforms";
import { useGames } from "@/queries/useGames";
import { Game, StorageType } from "@/generated/retrom/models/games";
import { GameMetadata } from "@/generated/retrom/models/metadata";
import { Link, useLocation } from "@tanstack/react-router";
import { useFilterAndSort } from "./filter-sort-context";
import { FiltersAndSorting } from "./filters-and-sorting";
import { Separator } from "../ui/separator";
import { filterName, sortGames, sortPlatforms } from "./utils";
import { ScrollArea } from "../ui/scroll-area";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { useInstallationStateQuery } from "@/queries/useInstallationState";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";

export function SideBar() {
  const {
    gameSortKey,
    filters,
    gameSortDirection,
    platformSortKey,
    platformSortDirection,
    groupByInstallationStatus,
  } = useFilterAndSort();

  const path = useLocation({ select: (location) => location.pathname });
  const { data: installationData } = useInstallationStateQuery();

  const { data: platformData, status: platformStatus } = usePlatforms({
    request: { withMetadata: true },
  });

  const { data: gameData, status: gameStatus } = useGames({
    request: { withMetadata: true },
  });

  const currentGame = useMemo(() => {
    try {
      const id = parseInt(path.split("games/")[1]?.split("/")[0]);
      return gameData?.games.find((game) => game.id === id);
    } catch {
      return undefined;
    }
  }, [path, gameData]);

  const loading = platformStatus === "pending" || gameStatus === "pending";
  const error = platformStatus === "error" || gameStatus === "error";

  const platformsWithMetadata = useMemo(() => {
    const platforms =
      platformData?.platforms.map((platform) => {
        const platformMetadata = platformData.metadata.find(
          (md) => md.platformId === platform.id,
        );

        return {
          ...platform,
          metadata: platformMetadata,
        };
      }) ?? [];

    return platforms.sort((a, b) =>
      sortPlatforms(a, b, platformSortKey, platformSortDirection),
    );
  }, [platformData, platformSortKey, platformSortDirection]);

  const gamesByPlatform = useMemo(() => {
    if (!gameData || !platformData) return {};
    const ret: Record<string, Array<Game & { metadata?: GameMetadata }>> = {};

    const platforms = platformData.platforms;
    const { games, metadata } = gameData;

    const gamesWithMetadata = games
      .map((game) => {
        const gameMetadata = metadata.find((m) => m.gameId === game.id);
        return {
          ...game,
          metadata: gameMetadata,
        };
      })
      .filter((game) => filterName(game, filters.name));

    return platforms.reduce((acc, platform) => {
      acc[platform.id] = gamesWithMetadata.filter(
        (game) => game.platformId === platform.id,
      );
      return acc;
    }, ret);
  }, [gameData, platformData, filters]);

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span>Error...</span>;
  }

  return (
    <aside
      className={cn(
        "min-h-full h-full w-[100cqw] min-w-0 flex flex-col",
        "bg-gradient-to-b from-primary/10 to-background",
      )}
    >
      <FiltersAndSorting />
      <Separator />

      <ScrollArea
        className={cn(
          "h-full max-h-full w-full max-w-full px-4 pb-4",
          "before:absolute before:inset-x-0 before:top-0 before:h-8 before:z-10",
          "before:bg-gradient-to-b before:from-black/60 before:to-transparent",
          "before:pointer-events-none",
        )}
      >
        <TooltipProvider>
          <Accordion
            type="single"
            collapsible={true}
            className="pt-4"
            defaultValue={currentGame?.platformId?.toString()}
          >
            {platformsWithMetadata.map((platform) => {
              const games = gamesByPlatform[platform.id] ?? [];

              games.sort((a, b) =>
                sortGames(a, b, gameSortKey, gameSortDirection),
              );

              if (groupByInstallationStatus) {
                games.sort((a, b) => {
                  const aInstalled =
                    installationData?.installationState.get(a.id) ===
                    InstallationStatus.INSTALLED;

                  const bInstalled =
                    installationData?.installationState.get(b.id) ===
                    InstallationStatus.INSTALLED;

                  if (aInstalled && !bInstalled) {
                    return -1;
                  }

                  if (!aInstalled && bInstalled) {
                    return 1;
                  }

                  return 0;
                });
              }

              const name =
                platform.metadata?.name || getFileStub(platform.path);

              return games?.length ? (
                <AccordionItem
                  key={platform.id}
                  value={platform.id.toString()}
                  className={cn("border-b-0 w-full max-w-full")}
                >
                  <AccordionTrigger
                    className={cn("py-2 font-medium overflow-hidden relative")}
                  >
                    <h3 className="text-left whitespace-nowrap overflow-ellipsis overflow-hidden">
                      {name}
                    </h3>
                    <span className="sr-only">Toggle</span>
                  </AccordionTrigger>

                  <AccordionContent>
                    <ul>
                      {games.map((game) => {
                        const isCurrentGame = currentGame?.id === game.id;
                        const isInstalled =
                          installationData?.installationState.get(game.id) ===
                          InstallationStatus.INSTALLED;

                        const gameMetadata = game.metadata;

                        const iconUrl = gameMetadata?.iconUrl;
                        const fallbackName =
                          game.storageType === StorageType.SINGLE_FILE_GAME
                            ? getFileStub(game.path)
                            : getFileName(game.path);

                        const gameName = gameMetadata?.name ?? fallbackName;

                        return (
                          <Tooltip key={game.id}>
                            <TooltipTrigger asChild>
                              <li
                                className={cn(
                                  "relative z-10 before:z-[-1] before:duration-200",
                                  "before:absolute before:inset-0 before:transition-opacity",
                                  "before:bg-gradient-to-r before:from-accent/80 before:opacity-0",
                                  "text-[1rem] text-muted-foreground/40 transition-all",
                                  !isCurrentGame &&
                                    "hover:before:opacity-60 hover:text-primary-foreground/80",
                                  isInstalled && "text-muted-foreground",
                                  isCurrentGame &&
                                    "before:opacity-100 text-primary-foreground",
                                  "max-w-full w-full overflow-hidden overflow-ellipsis px-3 my-1",
                                )}
                              >
                                <Link
                                  to="/games/$gameId"
                                  params={{ gameId: game.id.toString() }}
                                  className="grid grid-cols-[auto_1fr] items-center max-w-full h-full"
                                >
                                  <div className="relative min-w-[28px] min-h-[28px] mr-2 my-[2px]">
                                    {iconUrl && (
                                      <Image
                                        src={iconUrl}
                                        width={28}
                                        height={28}
                                        alt={gameName ?? ""}
                                      />
                                    )}
                                  </div>
                                  <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">
                                    <span>{gameName}</span>
                                  </span>
                                </Link>
                              </li>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent
                                side="right"
                                className="pointer-events-none touch-none"
                              >
                                {gameName}
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : null;
            })}
          </Accordion>
        </TooltipProvider>
      </ScrollArea>
    </aside>
  );
}
