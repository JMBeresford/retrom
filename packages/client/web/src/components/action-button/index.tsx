import { Button } from "@/components/ui/button";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { Game } from "@/generated/retrom/models/games";
import { checkIsDesktop, PlatformDependent } from "@/lib/env";
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
  const configStore = useConfig();
  const server = configStore((store) => store.server);
  const { data: installationState, status } = useInstallationQuery(game);

  const buttonClasses = cn(
    "rounded-none font-bold text-lg tracking-wider flex gap-2 items-center",
    className,
  );

  if (status === "pending") {
    return (
      <Button disabled {...rest} className={cn(buttonClasses)}>
        <LoaderCircleIcon />
      </Button>
    );
  }

  if (status === "error") {
    return null;
  }

  const restHost = checkIsDesktop()
    ? `${server.hostname}:${server.port}/rest`
    : "/api/rest";

  return (
    <PlatformDependent
      desktop={
        installationState === InstallationStatus.INSTALLED ? (
          <PlayGameButton {...rest} className={cn(buttonClasses)} />
        ) : (
          <InstallGameButton {...rest} className={cn(buttonClasses)} />
        )
      }
      web={
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
      }
    />
  );
}
