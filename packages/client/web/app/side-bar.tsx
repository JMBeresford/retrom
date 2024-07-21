"use client";

import { Image, cn } from "@/lib/utils";
import { useCallback, useMemo } from "react";
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
import { Game } from "@/generated/retrom/models/games";
import { Platform } from "@/generated/retrom/models/platforms";

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
      <aside className={cn("min-h-full h-full w-full min-w-0 max-w-full")}>
        <section className="w-full overflow-hidden">
          <Accordion
            type="multiple"
            defaultValue={platformData.platforms.map((p) => p.id.toString())}
          >
            {platformData.platforms.map((platform) => {
              let games = gamesByPlatform[platform.id];
              let name = getPlatformName(platform);

              return games ? (
                <AccordionItem
                  key={platform.id}
                  value={platform.id.toString()}
                  className="border-b-0"
                >
                  <AccordionTrigger className="py-0 pt-4 px-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-extrabold">{name}</h3>
                      <span className="sr-only">Toggle</span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <ul>
                      {games.map((game) => {
                        const currentGame = searchParams.get("gameId");

                        const isCurrentGame =
                          currentGame === game.id.toString();

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
                                  "pb-1 text-[1rem] text-muted-foreground/40 transition-all",
                                  !isCurrentGame &&
                                    "hover:text-muted-foreground",
                                  isCurrentGame &&
                                    "bg-gradient-to-r from-primary text-primary-foreground",
                                  "max-w-full w-full overflow-hidden overflow-ellipsis py-1 px-3",
                                )}
                              >
                                <Link
                                  href={`/game?platformId=${platform.id}&gameId=${game.id}`}
                                  className="grid grid-cols-[auto_1fr] items-center max-w-full"
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
                                  <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">
                                    <span>{gameName}</span>
                                  </span>
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
