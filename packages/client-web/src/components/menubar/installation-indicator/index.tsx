import { useInstallationIndex } from "@/providers/installation-index";
import { useInstallationProgressContext } from "@/providers/installation-progress";
import { match } from "@/utils/typescript";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import { Button } from "@retrom/ui/components/button";
import { Progress } from "@retrom/ui/components/progress";
import { cn } from "@retrom/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

export function InstallationIndicator() {
  const { installations } = useInstallationIndex();
  const installationProgress = useInstallationProgressContext((s) => s);

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

  return (
    <Button variant="inline" asChild>
      <Link
        to="/installing"
        className={cn(
          "text-muted-foreground italic text-sm",
          "hover:text-accent transition-colors",
        )}
      >
        {numToInstall > 0 ? (
          <div className="flex gap-2 items-center text-xs">
            Installing {completed.length + 1} /{" "}
            {numToInstall + completed.length}
            <Progress value={currentProgress} className="w-32" />
          </div>
        ) : (
          <p>{completed.length} games installed</p>
        )}
      </Link>
    </Button>
  );
}
