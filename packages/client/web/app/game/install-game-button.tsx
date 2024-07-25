import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { Button } from "../../components/ui/button";
import { LoaderCircleIcon } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { useInstallGame } from "@/mutations/useInstallGame";
import { InstallationStatus } from "@/generated/retrom/client-utils";
import { Progress } from "../../components/ui/progress";
import { useGameDetail } from "@/app/game/game-context";

export function InstallGameButton() {
  const { game, gameFiles: files } = useGameDetail();
  const { toast } = useToast();

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
      <Button className="rounded-none" disabled>
        Something went wrong...
      </Button>
    );
  }

  if (pending) {
    return (
      <Button className="rounded-none" disabled>
        <LoaderCircleIcon className="animate-spin" />
      </Button>
    );
  }

  if (installState === InstallationStatus.INSTALLING) {
    return (
      <div className="h-full grid place-items-center">
        <Progress value={installProgress} className="w-[85%] h-3" />
      </div>
    );
  }

  return (
    <Button
      className="rounded-none"
      onClick={async () => void install(undefined)}
    >
      Install
    </Button>
  );
}
