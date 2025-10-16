import { getFileName, getFileStub, Image } from "@/lib/utils";
import { useGameMetadata } from "@/queries/useGameMetadata";
import { useInstallationProgress } from "@/queries/useInstallationProgress";
import { useInstallationStatus } from "@/queries/useInstallationStatus";
import { createUrl, usePublicUrl } from "@/utils/urls";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { StorageType } from "@retrom/codegen/retrom/server/config_pb";
import { Skeleton } from "@retrom/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@retrom/ui/components/tooltip";
import { cn } from "@retrom/ui/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";

export function GameItem(props: { game: Game }) {
  const { game } = props;
  const { gameId: currentGameId } = useParams({ strict: false });

  const isCurrentGame = currentGameId === game.id.toString();
  const installationStatus = useInstallationStatus(game.id);
  const isInstalled = installationStatus === InstallationStatus.INSTALLED;
  const { percentComplete } = useInstallationProgress(game.id);
  const publicUrl = usePublicUrl();

  const { data: gameMetadata, status: gameMetadataStatus } = useGameMetadata({
    request: { gameIds: [game.id] },
    selectFn: (data) => {
      const meta = data.metadata.find((m) => m.gameId === game.id);
      const mediaPaths = data.mediaPaths[game.id];

      if (!meta) {
        throw new Error("No metadata found");
      }

      return { ...meta, mediaPaths };
    },
  });

  const fallbackName =
    game.storageType === StorageType.SINGLE_FILE_GAME
      ? getFileStub(game.path)
      : getFileName(game.path);

  const gameName = gameMetadata?.name ?? fallbackName;

  const iconUrl = useMemo(() => {
    const localPath = gameMetadata?.mediaPaths?.iconUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.iconUrl;
  }, [gameMetadata, publicUrl]);

  const isInstalling =
    installationStatus === InstallationStatus.INSTALLING ||
    installationStatus === InstallationStatus.PAUSED;

  if (gameMetadataStatus === "pending") {
    return <Skeleton className="w-full h-9" />;
  }

  return (
    <Tooltip key={game.id}>
      <TooltipTrigger asChild>
        <li
          className={cn(
            "relative h-9 z-10 before:z-[-1] before:duration-200",
            "border-l border-border",
            "before:absolute before:inset-0 before:transition-opacity",
            "before:bg-gradient-to-r before:from-accent/40 before:opacity-0",
            "text-[1rem] text-muted-foreground/40 transition-all",
            !isCurrentGame &&
              "sm:hover:before:opacity-60 sm:hover:text-primary-foreground/80",
            isInstalled && "text-muted-foreground",
            isCurrentGame &&
              "before:opacity-100 text-primary-foreground border-accent border-l-4",
            "max-w-full w-full overflow-hidden text-ellipsis px-2 py-0.5",
          )}
        >
          <Link
            to="/games/$gameId"
            params={{ gameId: game.id.toString() }}
            className={cn(
              "grid grid-cols-[auto_1fr] items-center max-w-full h-full",
            )}
          >
            <div className="relative min-w-[28px] min-h-[28px] mr-2 my-[2px]">
              {iconUrl && (
                <Image src={iconUrl} width={28} height={28} alt={gameName} />
              )}
            </div>

            <span
              className={cn(
                "whitespace-nowrap overflow-hidden text-ellipsis",
                isInstalling && "text-primary",
              )}
            >
              <span className="text-sm">
                {isInstalling ? `${percentComplete}% - ` : ""}
              </span>
              <span className={cn(isInstalling && "animate-pulse")}>
                {gameName}
              </span>
            </span>
          </Link>
        </li>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          side="right"
          className="hidden sm:block pointer-events-none touch-none"
        >
          {gameName}
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
}
