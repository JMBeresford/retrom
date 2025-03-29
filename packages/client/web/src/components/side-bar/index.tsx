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
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import {
  GameMetadata,
  PlatformMetadata,
} from "@retrom/codegen/retrom/models/metadata_pb";
import { Link, useLocation } from "@tanstack/react-router";
import { useFilterAndSort } from "./filter-sort-context";
import { FiltersAndSorting } from "./filters-and-sorting";
import { Separator } from "../ui/separator";
import { filterName, sortGames, sortPlatforms } from "./utils";
import { ScrollArea } from "../ui/scroll-area";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { useInstallationStateQuery } from "@/queries/useInstallationState";
import { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils_pb";
import { Skeleton } from "../ui/skeleton";
import { EllipsisVertical } from "lucide-react";
import { Platform } from "@retrom/codegen/retrom/models/platforms_pb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DropdownMenuTriggerProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { StorageType } from "@retrom/codegen/retrom/server/config_pb";

type PlatformWithMetadata = Platform & { metadata?: PlatformMetadata };

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

  const platformsWithMetadata: PlatformWithMetadata[] = useMemo(() => {
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
      const games = gamesWithMetadata.filter(
        (game) => game.platformId === platform.id,
      );

      games.sort((a, b) => sortGames(a, b, gameSortKey, gameSortDirection));

      if (groupByInstallationStatus) {
        games.sort((a, b) => {
          const aInstalled =
            installationData?.installationState[a.id] ===
            InstallationStatus.INSTALLED;

          const bInstalled =
            installationData?.installationState[b.id] ===
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

      acc[platform.id] = games;
      return acc;
    }, ret);
  }, [
    gameData,
    platformData,
    filters,
    gameSortDirection,
    gameSortKey,
    groupByInstallationStatus,
    installationData?.installationState,
  ]);

  return (
    <div className="w-full h-full @container/sidebar">
      <aside
        className={cn(
          "min-h-full h-full w-[100cqw] min-w-0 flex flex-col",
          "bg-gradient-to-b from-primary/10 to-background",
        )}
      >
        <FiltersAndSorting />
        <Separator />

        {loading ? (
          <div className="w-[100cqw] grow flex flex-col gap-4 bg-card p-4 *:h-12">
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
          </div>
        ) : error ? (
          <div className="w-full h-full grid place-items-center">
            <p className="text-muted-foreground text-lg">
              Could not load game data 😔
            </p>
          </div>
        ) : !platformsWithMetadata.some(
            (p) => gamesByPlatform[p.id]?.length,
          ) ? (
          <div className="h-full grid place-items-center">
            <div className="flex flex-col gap-4 text-center text-muted-foreground px-6">
              <h3 className="text-2xl font-bold">Where all the games at?</h3>

              <p>
                Make sure Retrom knows about your{" "}
                <Link   
                  className="text-accent-text"
                  to="."
                  search={(prev) => ({
                    ...prev,
                    configModal: { open: true, tab: "server" },
                  })}
                >
                  library sources
                </Link>{" "}
                and then{" "}
                <Link   
                  className="text-accent-text"
                  to="."
                  search={(prev) => ({
                    ...prev,
                    updateLibraryModal: { open: true },
                  })}
                >
                  update your library
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea
            className={cn(
              "h-full max-h-full w-full max-w-full px-3 sm:px-4 pb-4",
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

                  const name =
                    platform.metadata?.name || getFileStub(platform.path);

                  if (platform.thirdParty && !games.length) {
                    return null;
                  }

                  return (
                    <AccordionItem
                      key={platform.id}
                      value={platform.id.toString()}
                      className={cn("border-b-0 w-full max-w-full")}
                    >
                      <div
                        className={cn(
                          "group grid grid-cols-[1fr_auto] border-b border-transparent",
                          "sm:hover:border-border transition-all",
                        )}
                      >
                        <AccordionTrigger
                          hideIcon
                          className={cn(
                            "group py-2 font-medium overflow-hidden relative hover:no-underline",
                          )}
                        >
                          <div className="flex w-full">
                            <h3 className="text-left text-lg sm:text-base whitespace-nowrap overflow-ellipsis overflow-hidden">
                              {name}
                            </h3>
                            <span className="sr-only">Toggle</span>
                          </div>
                        </AccordionTrigger>
                        <PlatformContextMenu platform={platform} />
                      </div>

                      <AccordionContent>
                        {games.length ? (
                          <ul>
                            {games.map((game) => {
                              const isCurrentGame = currentGame?.id === game.id;
                              const isInstalled =
                                installationData?.installationState[game.id] ===
                                InstallationStatus.INSTALLED;

                              const gameMetadata = game.metadata;

                              const iconUrl = gameMetadata?.iconUrl;
                              const fallbackName =
                                game.storageType ===
                                StorageType.SINGLE_FILE_GAME
                                  ? getFileStub(game.path)
                                  : getFileName(game.path);

                              const gameName =
                                gameMetadata?.name ?? fallbackName;

                              return (
                                <Tooltip key={game.id}>
                                  <TooltipTrigger asChild>
                                    <li
                                      className={cn(
                                        "relative z-10 before:z-[-1] before:duration-200",
                                        "border-l border-border",
                                        "before:absolute before:inset-0 before:transition-opacity",
                                        "before:bg-gradient-to-r before:from-accent/40 before:opacity-0",
                                        "text-[1rem] text-muted-foreground/40 transition-all",
                                        !isCurrentGame &&
                                          "sm:hover:before:opacity-60 sm:hover:text-primary-foreground/80",
                                        isInstalled && "text-muted-foreground",
                                        isCurrentGame &&
                                          "before:opacity-100 text-primary-foreground border-accent border-l-4",
                                        "max-w-full w-full overflow-hidden overflow-ellipsis px-2 py-0.5",
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
                                      className="hidden sm:block pointer-events-none touch-none"
                                    >
                                      {gameName}
                                    </TooltipContent>
                                  </TooltipPortal>
                                </Tooltip>
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="grid place-items-center pt-4">
                            <p className="font-medium text-muted-foreground italic">
                              Theres no games here...
                            </p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TooltipProvider>
          </ScrollArea>
        )}
      </aside>
    </div>
  );
}

function PlatformContextMenu(
  props: DropdownMenuTriggerProps & { platform: PlatformWithMetadata },
) {
  const { platform, ...rest } = props;

  const name = platform.metadata?.name || getFileStub(platform.path);
  const { id, thirdParty } = platform;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        {...rest}
        className={cn(
          "sm:opacity-0 transition-opacity active:opacity-100",
          "sm:group-hover:opacity-100 data-[state=open]:opacity-100",
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className="w-fit h-fit aspect-square p-2 my-auto"
        >
          <EllipsisVertical className={cn("w-[1rem] h-[1rem]")} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "w-dvw flex flex-col items-center gap-2",
          "sm:w-auto sm:block",
        )}
      >
        <DropdownMenuItem
          asChild
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link   
            to="."
            search={(prev) => ({
              ...prev,
              updatePlatformMetadataModal: { open: true, id: platform.id },
            })}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="text-destructive-text"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link   
            to="."
            search={(prev) => ({
              ...prev,
              deletePlatformModal: {
                open: true,
                platform: { id, name, thirdParty },
              },
            })}
          >
            Delete
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
