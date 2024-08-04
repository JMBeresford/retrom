import { Button } from "@/components/ui/button";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { Game } from "@/generated/retrom/models/games";
import { IS_DESKTOP } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useConfig } from "@/providers/config";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { DownloadIcon, LoaderCircleIcon } from "lucide-react";
import { PlayGameButton } from "./play-game-button";
import { InstallGameButton } from "./install-game-button";
import { ComponentProps } from "react";

export function ActionButton(
  props: { game: Game } & ComponentProps<typeof Button>,
) {
  const { game, className, ...rest } = props;
  const { config } = useConfig();
  const { data: installationState, status } = useInstallationQuery(game);

  const buttonClasses = cn(
    "rounded-none font-bold text-lg tracking-wider flex gap-2 items-center",
    className,
  );

  if (config.status === "pending" || status === "pending") {
    return (
      <Button disabled {...rest} className={cn(buttonClasses)}>
        <LoaderCircleIcon />
      </Button>
    );
  }

  if (config.status === "error" || status === "error") {
    return null;
  }

  const restHost = `${config.data.server.hostname}:${config.data.server.port}/rest`;

  return (
    <>
      {IS_DESKTOP ? (
        installationState === InstallationStatus.INSTALLED ? (
          <PlayGameButton {...rest} className={cn(buttonClasses)} />
        ) : (
          <InstallGameButton {...rest} className={cn(buttonClasses)} />
        )
      ) : (
        <form action={`${restHost}/game/${game.id}`} className="w-full">
          <Button
            type="submit"
            {...rest}
            className={cn(buttonClasses, "w-full")}
          >
            <DownloadIcon className="h-[1.2rem] w-[1.2rem]" />
            Download
          </Button>
        </form>
      )}
    </>
  );
}
