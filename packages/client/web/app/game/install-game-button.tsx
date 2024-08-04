import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { Button } from "../../components/ui/button";
import {
  CircleAlertIcon,
  DownloadCloudIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useInstallGame } from "@/mutations/useInstallGame";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { Progress } from "../../components/ui/progress";
import { useGameDetail } from "@/app/game/game-context";
import { ComponentProps } from "react";

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
    return (
      <div className="h-full grid place-items-center">
        <Progress value={installProgress} className="w-[85%] h-2" />
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
