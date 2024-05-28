"use client";

import {
  Game,
  GameMetadata,
  Platform,
  PlatformMetadata,
} from "@/generated/retrom";
import { useRetromClient } from "@/providers/retrom-client/web";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { PropsWithChildren, createContext, useContext } from "react";

export type GameDetailContext = {
  game: Game;
  platform: Platform;
  gameMetadata?: GameMetadata;
  platformMetadata?: PlatformMetadata;
};

const GameDetailContext = createContext<GameDetailContext | null>(null);

type Props = {
  id: number;
  platformId: number;
};

export function GameDetailProvider(props: PropsWithChildren<Props>) {
  const retromClient = useRetromClient();
  const { id, platformId, children } = props;

  const { data: gameData, status: gameStatus } = useQuery({
    queryKey: ["games", "game-metadata", id],
    queryFn: async () => {
      return await retromClient.gameClient.getGames({
        withMetadata: true,
        ids: [id],
      });
    },
    select: (data) => {
      const game = data.games.at(0);
      const gameMetadata = data.metadata.at(0);

      if (!game) {
        throw new Error(`Game with id ${id} not found`);
      }

      return {
        game,
        gameMetadata,
      };
    },
  });

  const { data: platformData, status: platformStatus } = useQuery({
    queryKey: ["platforms", "platform-metadata", platformId],
    queryFn: async () => {
      return await retromClient.platformClient.getPlatforms({
        withMetadata: true,
        ids: [platformId],
      });
    },
    select: (data) => {
      const platform = data.platforms.at(0);
      const platformMetadata = data.metadata.at(0);

      if (!platform) {
        throw new Error(`Platform with id ${platformId} not found`);
      }

      return {
        platform,
        platformMetadata,
      };
    },
  });

  if (gameStatus === "error" || platformStatus === "error") {
    return redirect("/500");
  }

  if (gameStatus === "pending" || platformStatus === "pending") {
    return <span>Loading...</span>;
  }

  const value = {
    game: gameData.game,
    platform: platformData.platform,
    gameMetadata: gameData.gameMetadata,
    platformMetadata: platformData.platformMetadata,
  };

  return (
    <GameDetailContext.Provider value={value}>
      {children}
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
