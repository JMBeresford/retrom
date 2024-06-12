import { Game, GameFile } from "@/generated/retrom/models";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { Button } from "./ui/button";
import { LoaderCircle, LoaderCircleIcon } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useInstallGame } from "@/mutations/useInstallGame";
import { InstallationStatus } from "@/generated/retrom/client-utils";
import { Progress } from "./ui/progress";

export function InstallGameButton(props: { game: Game; files: GameFile[] }) {
  const { game, files } = props;
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
    toast({
      title: "Error checking installation",
      description:
        "An error occurred while checking if the game is installed. Check the logs for more information.",
      variant: "destructive",
    });

    return <Button disabled>Install</Button>;
  }

  if (pending) {
    return (
      <Button disabled>
        <LoaderCircleIcon className="animate-spin" />
      </Button>
    );
  }

  if (installState === InstallationStatus.INSTALLED) {
    return <Button disabled>Play</Button>;
  }

  if (installState === InstallationStatus.INSTALLING) {
    return (
      <div className="h-full grid place-items-center">
        <Progress value={installProgress} className="w-[85%] h-3" />
      </div>
    );
  }

  return <Button onClick={async () => void install()}>Install</Button>;
}
