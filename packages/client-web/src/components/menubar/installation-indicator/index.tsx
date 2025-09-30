import { Image } from "@/lib/utils";
import { useInstallationIndex } from "@/providers/installation-index";
import { useInstallationProgressContext } from "@/providers/installation-progress";
import { useGameMetadata } from "@/queries/useGameMetadata";
import { match } from "@/utils/typescript";
import { createUrl, usePublicUrl } from "@/utils/urls";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import { Button } from "@retrom/ui/components/button";
import { Progress } from "@retrom/ui/components/progress";
import { cn } from "@retrom/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

export function InstallationIndicator() {
  const { installations } = useInstallationIndex();
  const installationProgress = useInstallationProgressContext((s) => s);
  const publicUrl = usePublicUrl();

  const [installing, queued, completed] = useMemo(() => {
    const installing: number[] = [];
    const queued: number[] = [];
    const completed: number[] = [];

    for (const [gameId, status] of Object.entries(installations).filter(
      ([gameId]) => gameId in installationProgress,
    )) {
      match(status, {
        [InstallationStatus.INSTALLING]: () => installing.push(Number(gameId)),
        [InstallationStatus.PAUSED]: () => queued.push(Number(gameId)),
        [InstallationStatus.INSTALLED]: () => completed.push(Number(gameId)),
        default: () => {},
      });
    }

    return [installing, queued, completed];
  }, [installations, installationProgress]);

  const { data: iconUrl } = useGameMetadata({
    request: { gameIds: installing },
    selectFn: ({ mediaPaths }) => {
      const installingId = installing.at(0);
      if (publicUrl === undefined || installingId === undefined) {
        return null;
      }

      const localPath = mediaPaths[installingId]?.iconUrl;
      if (localPath === undefined) {
        return null;
      }

      return createUrl({ path: localPath, base: publicUrl })?.href ?? null;
    },
  });

  const currentProgress = useMemo(
    () =>
      installing.reduce((acc, gameId) => {
        const progress =
          installationProgress[gameId]?.at(-1)?.metrics?.percentComplete ?? 0;

        return acc + progress;
      }, 0) / installing.length,
    [installing, installationProgress],
  );

  const numToInstall = installing.length + queued.length;
  const totalInstallations =
    installing.length + completed.length + queued.length;

  return (
    <Button variant="inline" asChild>
      <Link
        to="/installing"
        className={cn(
          totalInstallations === 0 &&
            "pointer-events-none touch-none opacity-0",
          "text-muted-foreground italic text-sm",
          "hover:text-foreground transition-colors",
          "flex gap-2",
        )}
      >
        {iconUrl ? <Image className="min-w-0 h-full" src={iconUrl} /> : <></>}
        {numToInstall > 0 ? (
          <div className="flex flex-col text-xs">
            <div className="flex justify-between">
              <span>
                Installing {completed.length + 1} /{" "}
                {numToInstall + completed.length}
              </span>
              <span>{Math.floor(currentProgress)}%</span>
            </div>

            <Progress value={currentProgress} className="my-1 w-64" />
          </div>
        ) : (
          <p>
            {`${completed.length} ${completed.length > 1 ? "games" : "game"} installed`}
          </p>
        )}
      </Link>
    </Button>
  );
}
