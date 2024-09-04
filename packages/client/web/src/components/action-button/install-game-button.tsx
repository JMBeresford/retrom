import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { Button } from "../ui/button";
import {
  CircleAlertIcon,
  DownloadCloudIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useInstallGame } from "@/mutations/useInstallGame";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { Progress } from "../ui/progress";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";

export function InstallGameButton(props: ComponentProps<typeof Button>) {
  const { game, gameFiles: files } = useGameDetail();

  const installationQuery = useInstallationQuery(game);
  const installationRequest = useInstallGame(game, files);

  const installState = installationQuery.data;
  const installProgress = installationRequest.progress;
  const install = installationRequest.mutate;

  const error =
    installationQuery.status === "error" ||
    installationRequest.status === "error";

  const pending =
    installationQuery.status === "pending" ||
    installationRequest.status === "pending";

  if (error) {
    return (
      <Button {...props} disabled>
        <CircleAlertIcon />
        Error
      </Button>
    );
  }

  if (pending) {
    return (
      <Button {...props} disabled>
        <LoaderCircleIcon className="animate-spin" />
        Installing
      </Button>
    );
  }

  if (installState === InstallationStatus.INSTALLING) {
    const { className } = props;

    return (
      <div
        className={cn(
          className,
          "h-full min-w-[100px] grid place-items-center",
        )}
      >
        <Progress value={installProgress} className="h-2" />
      </div>
    );
  }

  return (
    <Button {...props} onClick={async () => void install(undefined)}>
      <DownloadCloudIcon className="h-[1.2rem] 1-[1.2rem]" />
      Install
    </Button>
  );
}
