import { useGameMetadata } from "@/queries/useGameMetadata";
import { useGames } from "@/queries/useGames";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import {
  GameMetadata,
  PlatformMetadata,
} from "@retrom/codegen/retrom/models/metadata_pb";
import { Platform } from "@retrom/codegen/retrom/models/platforms_pb";
import { GetGameMetadataResponse_MediaPaths } from "@retrom/codegen/retrom/services/metadata-service_pb";
import { cn } from "@retrom/ui/lib/utils";
import {
  createContext,
  HTMLAttributes,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";

export type PlatformWithMetadata = Platform & { metadata?: PlatformMetadata };

export type SidebarMetadataContextState = {
  platform: PlatformWithMetadata;
  games?: Game[];
  gameMetadata?: Array<
    GameMetadata & { mediaPaths: GetGameMetadataResponse_MediaPaths }
  >;
};

const SidebarMetadataContext = createContext<
  SidebarMetadataContextState | undefined
>(undefined);

export function SidebarMetadataProvider(
  props: PropsWithChildren<
    { platform: PlatformWithMetadata } & HTMLAttributes<HTMLDivElement>
  >,
) {
  const { platform, children, className, ...rest } = props;

  const { data: gameData, status: gamesStatus } = useGames({
    request: { platformIds: [platform.id] },
  });

  const { data: gameMetadataData } = useGameMetadata({
    enabled: gamesStatus === "success",
    request: { gameIds: gameData?.games.map((g) => g.id) },
    selectFn: (data) =>
      data.metadata.map((m) => ({
        ...m,
        mediaPaths: data.mediaPaths[m.gameId],
      })),
  });

  const value = useMemo(
    () => ({
      platform,
      games: gameData?.games,
      gameMetadata: gameMetadataData,
    }),
    [platform, gameData, gameMetadataData],
  );

  return (
    <SidebarMetadataContext.Provider value={value}>
      <div {...rest} className={cn(className, "relative")}>
        {children}
      </div>
    </SidebarMetadataContext.Provider>
  );
}

export function useSidebarMetadataContext() {
  const context = useContext(SidebarMetadataContext);

  if (!context) {
    throw new Error(
      "useMetadataContext must be used within a SidebarMetadataProvider",
    );
  }

  return context;
}
