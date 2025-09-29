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
import { useGameDetail } from "@/providers/game-details";
import { useInstallationProgress } from "@/queries/useInstallationProgress";

export const InstallGameButton = forwardRef(
  (
    props: ComponentProps<typeof Button>,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { game } = useGameDetail();
    const { className, ...rest } = props;

    const installationStatus = useInstallationStatus(game.id);
    const installationRequest = useInstallGame(game);
    const installProgress = useInstallationProgress(game.id);

    const installState = installationStatus;
    const install = installationRequest.mutate;

    const error = installationRequest.status === "error";
    const pending = installationRequest.status === "pending";

    const disabled = error || pending;

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

      if (installState === InstallationStatus.INSTALLING) {
        return (
          <div className="flex gap-2 w-full items-center">
            <p className="text-sm">{Math.floor(installProgress)}%</p>
            <Progress value={installProgress} className="h-1" />
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
          installState === InstallationStatus.INSTALLING
            ? undefined
            : () => install(undefined)
        }
      >
        <Content />
      </Button>
    );
  },
);
