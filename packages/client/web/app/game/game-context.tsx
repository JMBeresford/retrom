"use client";

import { toast } from "@/components/ui/use-toast";
import { GameFile } from "@/generated/retrom/models/game-files";
import { Game } from "@/generated/retrom/models/games";
import {
  GameMetadata,
  PlatformMetadata,
} from "@/generated/retrom/models/metadata";
import { Platform } from "@/generated/retrom/models/platforms";

import {
  GetGameMetadataResponse_GameGenres,
  GetGameMetadataResponse_SimilarGames,
} from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PropsWithChildren, createContext, useContext } from "react";

export type GameDetailContext = {
  game: Game;
  gameFiles: GameFile[];
  platform: Platform;
  gameMetadata?: GameMetadata;
  extraMetadata?: {
    genres?: GetGameMetadataResponse_GameGenres;
    similarGames?: GetGameMetadataResponse_SimilarGames;
  };
  platformMetadata?: PlatformMetadata;
};

const GameDetailContext = createContext<GameDetailContext | null>(null);

export function GameDetailProvider(props: PropsWithChildren<{ game?: Game }>) {
  const { game } = props;
  const params = useSearchParams();
  const router = useRouter();
  const retromClient = useRetromClient();

  const gameId = game?.id ?? parseInt(params.get("gameId") ?? "");

  const { data: gameData, status: gameStatus } = useQuery({
    queryKey: ["games", "game-metadata", gameId],
    queryFn: async () => {
      const data = await retromClient.gameClient.getGames({
        withFiles: true,
        ids: [gameId],
      });

      const game = data.games.at(0);
      const gameFiles = data.gameFiles;

      return {
        game,
        gameFiles,
      };
    },
  });

  const paramsPlatformId = params.get("platformId");
  const platformId =
    gameData?.game?.platformId ??
    (paramsPlatformId !== null ? parseInt(paramsPlatformId) : undefined);

  const { data: gameMetadata, status: gameMetadataStatus } = useQuery({
    queryKey: ["game", "games", "game-metadata", gameId],
    queryFn: async () =>
      retromClient.metadataClient.getGameMetadata({
        gameIds: [gameId],
      }),
  });

  const { data: platformData, status: platformStatus } = useQuery({
    queryKey: ["platforms", "platform-metadata", platformId],
    enabled: platformId !== undefined,
    queryFn: async () => {
      const data = await retromClient.platformClient.getPlatforms({
        withMetadata: true,
        ids: [platformId!],
      });

      const platform = data.platforms.at(0);
      const platformMetadata = data.metadata.at(0);

      return {
        platform,
        platformMetadata,
      };
    },
  });

  if (
    gameStatus === "error" ||
    platformStatus === "error" ||
    gameMetadataStatus === "error"
  ) {
    return <span>Error loading game details</span>;
  }

  if (
    gameStatus === "pending" ||
    platformStatus === "pending" ||
    gameMetadataStatus === "pending"
  ) {
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
    gameFiles: gameData.gameFiles,
    platform: platformData.platform,
    gameMetadata: gameMetadata.metadata.at(0),
    extraMetadata: {
      genres: gameMetadata.genres.get(gameData.game.id),
      similarGames: gameMetadata.similarGames.get(gameData.game.id),
    },
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
