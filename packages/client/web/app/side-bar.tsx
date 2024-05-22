"use client";

import { Button } from "../components/ui/button";
import { Image, cn, toInitials } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";
import {
  Game,
  GameMetadata,
  Platform,
  PlatformMetadata,
} from "@/generated/retrom";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

type Props = {
  games: Game[];
  gamesMetadata: GameMetadata[];
  platforms: Platform[];
  platformsMetadata: PlatformMetadata[];
};

export function SideBar(props: Props) {
  const path = usePathname();
  const { games, platforms, gamesMetadata, platformsMetadata } = props;
  const [platformFilters, setPlatformFilters] = useState(new Set<number>());

  const gamesByPlatform = useMemo(() => {
    const ret: Record<string, Array<Game>> = {};

    return platforms.reduce((acc, platform) => {
      acc[platform.id] = games.filter(
        (game) => game.platformId === platform.id,
      );
      return acc;
    }, ret);
  }, [games, platforms]);

  const getPlatformName = useCallback(
    (platform: Platform) => {
      return (
        platformsMetadata.find((md) => md.platformId === platform.id)?.name ??
        platform.path.split("/").pop()
      );
    },
    [platformsMetadata],
  );

  return (
    <TooltipProvider>
      <aside
        className={cn("min-h-full h-full flex flex-col items-center px-3")}
      >
        <section className="w-full pt-3">
          <h2 className="text-muted-foreground text-sm">Filter by platform:</h2>

          <div className="flex flex-wrap gap-1 py-3">
            {platforms.map((platform) => {
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
            defaultValue={platforms.map((p) => p.id.toString())}
          >
            {platforms
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
                          const gameName =
                            gamesMetadata.find((m) => m.gameId === game.id)
                              ?.name ?? game.path.split("/").pop();

                          const iconUrl = gamesMetadata.find(
                            (m) => m.gameId === game.id,
                          )?.iconUrl;

                          return (
                            <Tooltip key={game.id}>
                              <TooltipTrigger asChild>
                                <li
                                  className={cn(
                                    "pb-1 text-[1rem] text-muted-foreground/40 transition-colors",
                                    "hover:text-muted-foreground",
                                    path === `/games/${game.id}` &&
                                      "text-muted-foreground",
                                    "max-w-full whitespace-nowrap overflow-hidden overflow-ellipsis",
                                  )}
                                >
                                  <Link
                                    href={`/games/${game.id}`}
                                    className="flex items-center"
                                  >
                                    <div className="relative min-w-[24px] min-h-[24px] mr-2">
                                      <Image
                                        src={iconUrl ?? ""}
                                        width={24}
                                        height={24}
                                        alt={gameName ?? ""}
                                      />
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
