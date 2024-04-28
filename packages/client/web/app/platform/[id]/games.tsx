"use client";

import { usePlatforms } from "@/hooks/usePlatforms";
import { Game, Metadata } from "@/generated/retrom";
import Image from "next/image";
import { useGames } from "@/hooks/useGames";
import { useMemo } from "react";

type GamesWithMetadata = {
  games: Game[];
  metadata: Record<string, Metadata>;
};

type Props = {
  platform_id: string;
};

export function Games(props: Props) {
  const [platform] =
    usePlatforms({ ids: [props.platform_id] })?.platforms ?? [];
  const game_data = useGames({
    platformIds: [props.platform_id],
    withMetadata: true,
  });

  const data = useMemo(() => {
    const gamesWithMetadata: GamesWithMetadata = {
      games: game_data?.games ?? [],
      metadata: {},
    };

    game_data?.metadata.forEach((metadata) => {
      gamesWithMetadata.metadata[metadata.gameId] = metadata;
    });

    return gamesWithMetadata;
  }, [game_data]);

  if (!platform) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-black">{platform.name}</h1>

      <div className="grid grid-cols-3 gap-4">
        {data?.games.map((game) => {
          let metadata = data?.metadata[game.id];
          return (
            <div className="relative" key={game.id}>
              {metadata?.coverUrl && (
                <Image
                  src={metadata.coverUrl}
                  width={264}
                  height={374}
                  alt="cover"
                />
              )}
              <h3 className="text-xl font-bold mb-2">{game.name}</h3>
              <p className="text-sm max-w-[40ch]">{metadata?.description}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
