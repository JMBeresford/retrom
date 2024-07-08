"use client";

import { Button } from "../components/ui/button";
import { Image, cn } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";
import { Game, Platform } from "@/generated/retrom/models";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

export function SideBar() {
  const searchParams = useSearchParams();

  const { data: platformData, status: platformStatus } = usePlatforms({
    request: { withMetadata: true },
  });

  const { data: gameData, status: gameStatus } = useGames({
    withMetadata: true,
  });

  const loading = platformStatus === "pending" || gameStatus === "pending";
  const error = platformStatus === "error" || gameStatus === "error";

  const [platformFilters, setPlatformFilters] = useState(new Set<number>());

  const gamesByPlatform = useMemo(() => {
    if (!gameData || !platformData) return {};
    const ret: Record<string, Array<Game>> = {};

    const { platforms } = platformData;

    return platforms.reduce((acc, platform) => {
      acc[platform.id] = gameData.games.filter(
        (game) => game.platformId === platform.id,
      );
      return acc;
    }, ret);
  }, [gameData, platformData]);

  const getPlatformName = useCallback(
    (platform: Platform) => {
      return (
        platformData?.metadata.find((md) => md.platformId === platform.id)
          ?.name ?? platform.path.split("/").pop()
      );
    },
    [platformData],
  );

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span>Error...</span>;
  }

  return (
    <TooltipProvider>
      <aside
        className={cn("min-h-full h-full flex flex-col items-center px-3")}
      >
        <section className="w-full pt-3">
          <h2 className="text-muted-foreground text-sm">Filter by platform:</h2>

          <div className="flex flex-wrap gap-1 py-3">
            {platformData.platforms.map((platform) => {
              const platformName = getPlatformName(platform);

              return (
                <Tooltip key={platform.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (platformFilters.has(platform.id)) {
                          platformFilters.delete(platform.id);
                          setPlatformFilters(new Set(platformFilters));
                        } else {
                          setPlatformFilters(
                            new Set(platformFilters.add(platform.id)),
                          );
                        }
                      }}
                      className={cn(
                        "rounded transition-colors bg-transparent text-xs font-semibold",
                        platformFilters.has(platform.id) &&
                          "hover:bg-primary hover:text-primary-foreground bg-primary text-primary-foreground",
                      )}
                    >
                      {platformName}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{platformName}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </section>

        <section className="w-full flex flex-col gap-2 overflow-hidden">
          <Accordion
            type="multiple"
            defaultValue={platformData.platforms.map((p) => p.id.toString())}
          >
            {platformData.platforms
              .filter(
                (platform) =>
                  platformFilters.size === 0 ||
                  platformFilters.has(platform.id),
              )
              .map((platform) => {
                let games = gamesByPlatform[platform.id];
                let name = getPlatformName(platform);

                return games ? (
                  <AccordionItem
                    key={platform.id}
                    value={platform.id.toString()}
                  >
                    <AccordionTrigger className="py-0 pt-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-extrabold">{name}</h3>
                        <span className="sr-only">Toggle</span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <ul>
                        {games.map((game) => {
                          const currentGame = searchParams.get("gameId");
                          const currentPlatform =
                            searchParams.get("platformId");

                          const isCurrentGame =
                            currentGame === game.id.toString() &&
                            currentPlatform === platform.id.toString();

                          const gameMetadata = gameData.metadata.find(
                            (m) => m.gameId === game.id,
                          );

                          const iconUrl = gameMetadata?.iconUrl;
                          const gameName =
                            gameMetadata?.name ?? game.path.split("/").pop();

                          return (
                            <Tooltip key={game.id}>
                              <TooltipTrigger asChild>
                                <li
                                  className={cn(
                                    "pb-1 text-[1rem] text-muted-foreground/40 transition-colors",
                                    "hover:text-muted-foreground",
                                    isCurrentGame && "text-muted-foreground",
                                    "max-w-full whitespace-nowrap overflow-hidden overflow-ellipsis",
                                  )}
                                >
                                  <Link
                                    href={`/game?platformId=${platform.id}&gameId=${game.id}`}
                                    className="flex items-center"
                                  >
                                    <div className="relative min-w-[24px] min-h-[24px] mr-2">
                                      {iconUrl && (
                                        <Image
                                          src={iconUrl}
                                          width={24}
                                          height={24}
                                          alt={gameName ?? ""}
                                        />
                                      )}
                                    </div>
                                    {gameName}
                                  </Link>
                                </li>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{gameName}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ) : null;
              })}
          </Accordion>
        </section>
      </aside>
    </TooltipProvider>
  );
}
