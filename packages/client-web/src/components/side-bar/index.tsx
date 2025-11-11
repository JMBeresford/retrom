import { useGames } from "@/queries/useGames";
import { usePlatforms } from "@/queries/usePlatforms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retrom/ui/components/accordion";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { Separator } from "@retrom/ui/components/separator";
import { Skeleton } from "@retrom/ui/components/skeleton";
import { TooltipProvider } from "@retrom/ui/components/tooltip";
import { cn } from "@retrom/ui/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import { useFilterAndSort } from "./filter-sort-context";
import { FiltersAndSorting } from "./filters-and-sorting";
import { GameList } from "./game-list";
import { sortPlatforms } from "./utils";
import {
  PlatformWithMetadata,
  SidebarMetadataProvider,
} from "./metadata-context";
import { getFileStub } from "@/lib/utils";
import { PlatformContextMenu } from "./platform-context-menu";

export function SideBar() {
  const router = useRouter();
  const { platformSortKey, platformSortDirection } = useFilterAndSort();

  const gameId = router.state.location.pathname.match(/\/games\/(?<gameId>\d+)/)
    ?.groups?.gameId;

  const { data: platformData, status: platformStatus } = usePlatforms({
    request: { withMetadata: true },
  });

  const { data: currentGame, status: currentGameStatus } = useGames({
    request: { ids: gameId ? [parseInt(gameId)] : [-1] },
    selectFn: (data) => data.games[0],
  });

  const loading =
    platformStatus === "pending" || currentGameStatus === "pending";
  const error = platformStatus === "error" || currentGameStatus === "error";

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
                  const name =
                    platform.metadata?.name || getFileStub(platform.path);

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
                            <h3 className="text-left text-lg sm:text-base whitespace-nowrap text-ellipsis overflow-hidden">
                              {name}
                            </h3>
                            <span className="sr-only">Toggle</span>
                          </div>
                        </AccordionTrigger>

                        <PlatformContextMenu platform={platform} />
                      </div>

                      <AccordionContent>
                        <SidebarMetadataProvider platform={platform}>
                          <GameList />
                        </SidebarMetadataProvider>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}

                <div className="not-only:hidden py-10 grid place-items-center">
                  <div className="flex flex-col gap-4 text-center text-muted-foreground px-6">
                    <h3 className="text-2xl font-bold italic text-pretty">
                      Where are all the games at?
                    </h3>

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
              </Accordion>
            </TooltipProvider>
          </ScrollArea>
        )}
      </aside>
    </div>
  );
}
