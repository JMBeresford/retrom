"use client";

import { toast } from "@/components/ui/use-toast";
import {
  Game,
  GameMetadata,
  Platform,
  PlatformMetadata,
} from "@/generated/retrom";
import { useRetromClient } from "@/providers/retrom-client/web";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PropsWithChildren, createContext, useContext } from "react";

export type GameDetailContext = {
  game: Game;
  platform: Platform;
  gameMetadata?: GameMetadata;
  platformMetadata?: PlatformMetadata;
};

const GameDetailContext = createContext<GameDetailContext | null>(null);

export function GameDetailProvider(props: PropsWithChildren) {
  const params = useSearchParams();
  const router = useRouter();
  const retromClient = useRetromClient();

  const gameId = parseInt(params.get("gameId") ?? "");
  const platformId = parseInt(params.get("platformId") ?? "");

  const { data: gameData, status: gameStatus } = useQuery({
    queryKey: ["games", "game-metadata", gameId],
    queryFn: async () => {
      const data = await retromClient.gameClient.getGames({
        withMetadata: true,
        ids: [gameId],
      });

      const game = data.games.at(0);
      const gameMetadata = data.metadata.at(0);

      return {
        game,
        gameMetadata,
      };
    },
  });

  const { data: platformData, status: platformStatus } = useQuery({
    queryKey: ["platforms", "platform-metadata", platformId],
    queryFn: async () => {
      const data = await retromClient.platformClient.getPlatforms({
        withMetadata: true,
        ids: [platformId],
      });

      const platform = data.platforms.at(0);
      const platformMetadata = data.metadata.at(0);

      return {
        platform,
        platformMetadata,
      };
    },
  });

  if (gameStatus === "error" || platformStatus === "error") {
    return <span>Error loading game details</span>;
  }

  if (gameStatus === "pending" || platformStatus === "pending") {
    return <span>Loading...</span>;
  }

  if (!gameData.game || !platformData.platform) {
    toast({
      title: "Error loading game details",
      description: "Game or platform not found",
      variant: "destructive",
      duration: 5000,
    });

    router.replace("/");
    return <></>;
  }

  const value = {
    game: gameData.game,
    platform: platformData.platform,
    gameMetadata: gameData.gameMetadata,
    platformMetadata: platformData.platformMetadata,
  };

  return (
    <GameDetailContext.Provider value={value}>
      {props.children}
    </GameDetailContext.Provider>
  );
}

export function useGameDetail() {
  const context = useContext(GameDetailContext);

  if (!context) {
    throw new Error("useGameDetail must be used within a GameDetailProvider");
  }

  return context;
}
