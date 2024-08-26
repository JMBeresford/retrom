"use client";

import { Image, cn, getFileStub } from "@/lib/utils";
import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
import { GameMetadata } from "@/generated/retrom/models/metadata";
import { useJobProgress } from "@/queries/useJobProgress";

export function SideBar() {
  const searchParams = useSearchParams();
  const path = usePathname();
  const {} = useJobProgress();

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
    const ret: Record<string, Array<Game & { metadata?: GameMetadata }>> = {};

    const { platforms } = platformData;
    const { games, metadata } = gameData;

    const gamesWithMetadata = games.map((game) => {
      const gameMetadata = metadata.find((m) => m.gameId === game.id);
      return {
        ...game,
        metadata: gameMetadata,
      };
    });

    return platforms.reduce((acc, platform) => {
      acc[platform.id] = gamesWithMetadata.filter(
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
          <Accordion type="single" collapsible={true} className="mt-2">
            {platformData.platforms.map((platform) => {
              let games = gamesByPlatform[platform.id]?.sort((a, b) => {
                const aName = a.metadata?.name ?? getFileStub(a.path) ?? "";
                const bName = b.metadata?.name ?? getFileStub(b.path) ?? "";

                return aName.localeCompare(bName);
              });

              let name = getPlatformName(platform);

              return games ? (
                <AccordionItem
                  key={platform.id}
                  value={platform.id.toString()}
                  className="border-b-0"
                >
                  <AccordionTrigger className="py-1 px-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-medium">{name}</h3>
                      <span className="sr-only">Toggle</span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <ul>
                      {games.map((game) => {
                        const currentGame = path
                          .split("games/")?.[1]
                          ?.split("/")[0];

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
                                  href={`/games/${game.id}`}
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
