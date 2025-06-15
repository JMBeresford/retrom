import { toast } from "@/components/ui/use-toast";
import {
  Emulator,
  EmulatorProfile,
  Emulator_OperatingSystem,
} from "@retrom/codegen/retrom/models/emulators_pb";
import { GameFile } from "@retrom/codegen/retrom/models/game-files_pb";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import {
  GameMetadata,
  PlatformMetadata,
} from "@retrom/codegen/retrom/models/metadata_pb";
import { Platform } from "@retrom/codegen/retrom/models/platforms_pb";
import {
  GetGameMetadataResponse_GameGenres,
  GetGameMetadataResponse_SimilarGames,
} from "@retrom/codegen/retrom/services/metadata-service_pb";
import { checkIsDesktop } from "@/lib/env";
import { useRetromClient } from "@/providers/retrom-client";
import { useDefaultEmulatorProfiles } from "@/queries/useDefaultEmulatorProfiles";
import { useEmulatorProfiles } from "@/queries/useEmulatorProfiles";
import { useEmulators } from "@/queries/useEmulators";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { useConfig } from "../config";
import { getFileStub } from "@/lib/utils";
import { Code, ConnectError } from "@connectrpc/connect";

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
  emulator?: Emulator;
  validEmulators: Emulator[];
  defaultProfile?: EmulatorProfile;
  validProfiles: EmulatorProfile[];
  name: string;
};

const GameDetailContext = createContext<GameDetailContext | null>(null);

export function GameDetailProvider(
  props: PropsWithChildren<{ gameId: number; errorRedirectUrl?: string }>,
) {
  const { gameId, errorRedirectUrl = "/" } = props;
  const fullscreenByDefault = useConfig(
    (s) => s.config?.interface?.fullscreenByDefault,
  );
  const retromClient = useRetromClient();

  const {
    data: gameData,
    status: gameStatus,
    error,
  } = useQuery({
    queryKey: ["games", "game-metadata", "game-files", gameId],
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

  const platformId = gameData?.game?.platformId;

  const { data: gameMetadata, status: gameMetadataStatus } = useQuery({
    queryKey: ["game", "games", "game-metadata", "games-metadata", gameId],
    queryFn: async () => {
      const response = await retromClient.metadataClient.getGameMetadata({
        gameIds: [gameId],
      });
      return response;
    },
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

  const { data: defaultProfileId, status: defaultEmulatorProfileStatus } =
    useDefaultEmulatorProfiles({
      enabled: platformData?.platform !== undefined,
      request: {
        platformIds:
          platformData?.platform?.id !== undefined
            ? [platformData.platform.id]
            : [-1],
      },
      selectFn: (data) => data.defaultProfiles.at(0)?.emulatorProfileId,
    });

  const { data: emulators, status: emulatorsStatus } = useEmulators({
    enabled: platformData?.platform !== undefined,
    request: {
      ids: [],
      supportedPlatformIds:
        platformData?.platform?.id !== undefined
          ? [platformData.platform.id]
          : [-1],
    },
    selectFn: (data) =>
      data.emulators.filter(
        (e) =>
          checkIsDesktop() ||
          e.operatingSystems.includes(Emulator_OperatingSystem.WASM),
      ),
  });

  const { data: profiles, status: profilesStatus } = useEmulatorProfiles({
    enabled:
      emulatorsStatus === "success" &&
      defaultEmulatorProfileStatus === "success",
    selectFn: (data) => data.profiles,
    request: {
      ids: [],
      emulatorIds: emulators?.length
        ? emulators.map((emulator) => emulator.id)
        : [-1],
    },
  });

  const name = useMemo(
    () =>
      gameMetadata?.metadata.at(0)?.name || getFileStub(gameData?.game?.path),
    [gameData?.game, gameMetadata?.metadata],
  );

  if (
    (gameData && gameData.game === undefined) ||
    (error instanceof ConnectError && error.code === Code.NotFound)
  ) {
    const path = fullscreenByDefault ? "/fullscreen" : "/home";
    return <Navigate to={path} />;
  }
  const defaultProfile =
    profiles?.find((profile) => profile.id === defaultProfileId) ??
    profiles?.at(0);

  const emulator = defaultProfile
    ? emulators?.find((emulator) => emulator.id === defaultProfile.emulatorId)
    : emulators?.at(0);

  if (
    gameStatus === "error" ||
    platformStatus === "error" ||
    gameMetadataStatus === "error" ||
    defaultEmulatorProfileStatus === "error" ||
    emulatorsStatus === "error" ||
    profilesStatus === "error"
  ) {
    return <span>Error loading game details</span>;
  }

  if (
    gameStatus === "pending" ||
    platformStatus === "pending" ||
    gameMetadataStatus === "pending" ||
    defaultEmulatorProfileStatus === "pending" ||
    emulatorsStatus === "pending" ||
    profilesStatus === "pending"
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

    return <Navigate to={errorRedirectUrl}></Navigate>;
  }

  const value = {
    game: gameData.game,
    gameFiles: gameData.gameFiles,
    platform: platformData.platform,
    gameMetadata: gameMetadata.metadata.at(0),
    extraMetadata: {
      genres: gameMetadata.genres[gameData.game.id],
      similarGames: gameMetadata.similarGames[gameData.game.id],
    },
    platformMetadata: platformData.platformMetadata,
    emulator,
    validEmulators: emulators,
    defaultProfile,
    validProfiles: profiles,
    name,
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
