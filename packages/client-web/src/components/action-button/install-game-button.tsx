import { useInstallationStatus } from "@/queries/useInstallationStatus";
import { Button } from "@retrom/ui/components/button";
import {
  CircleAlertIcon,
  DownloadCloudIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useInstallGame } from "@/mutations/useInstallGame";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import { Progress } from "@retrom/ui/components/progress";
import { ComponentProps, ForwardedRef, forwardRef } from "react";
import { cn } from "@retrom/ui/lib/utils";
import { useInstallationProgress } from "@/queries/useInstallationProgress";
import { Game } from "@retrom/codegen/retrom/models/games_pb";

type InstallGameButtonProps = { game: Game } & ComponentProps<typeof Button>;

export const InstallGameButton = forwardRef(
  (
    props: InstallGameButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { game } = props;
    const { className, ...rest } = props;

    const installationRequest = useInstallGame(game.id);
    const installState = useInstallationStatus(game.id);
    const { percentComplete } = useInstallationProgress(game.id);

    const install = installationRequest.mutate;

    const error = installationRequest.status === "error";
    const pending = installationRequest.status === "pending";

    const disabled =
      error || pending || installState === InstallationStatus.PAUSED;

    const Content = () => {
      if (error) {
        return (
          <>
            <CircleAlertIcon />
            Error
          </>
        );
      }

      if (pending) {
        return (
          <div className="flex gap-3 w-full items-center text-base justify-center">
            <LoaderCircleIcon className="animate-spin" />
            <p>Starting Installation</p>
          </div>
        );
      }

      if (installState === InstallationStatus.PAUSED) {
        return (
          <div className="flex gap-3 w-full items-center text-base justify-center">
            <LoaderCircleIcon className="animate-spin" />
            <p>Installation Pending</p>
          </div>
        );
      }

      if (installState === InstallationStatus.INSTALLING) {
        return (
          <div className="flex gap-2 w-full items-center">
            <p className="text-sm">{Math.floor(percentComplete)}%</p>
            <Progress value={percentComplete} className="h-1" />
          </div>
        );
      }

      return (
        <>
          <DownloadCloudIcon className="h-[1.2rem] 1-[1.2rem]" />
          Install
        </>
      );
    };

    return (
      <Button
        ref={forwardedRef}
        {...rest}
        disabled={disabled || rest.disabled}
        className={cn(className, "relative")}
        onClick={
          installState === InstallationStatus.NOT_INSTALLED
            ? () => install(undefined)
            : undefined
        }
      >
        <Content />
      </Button>
    );
  },
);
