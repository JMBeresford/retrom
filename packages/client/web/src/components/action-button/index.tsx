import type { Button } from "@/components/ui/button";
import type { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils_pb";
import type { Game } from "@retrom/codegen/retrom/models/games_pb";
import { PlatformDependent } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { PlayGameButton } from "./play-game-button";
import { InstallGameButton } from "./install-game-button";
import { ComponentProps, ForwardedRef, forwardRef } from "react";
import { DownloadGameButton } from "./download-game-button";

export const ActionButton = forwardRef(
  (
    props: { game: Game } & ComponentProps<typeof Button>,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { game, className, ...rest } = props;
    const installationQuery = useInstallationQuery(game);
    const installationState = installationQuery.data;
    const status = installationQuery.status;

    const buttonClasses = cn(
      "rounded-none font-bold text-lg tracking-wider flex gap-2 items-center",
      className,
    );

    return (
      <PlatformDependent
        desktop={
          installationState === InstallationStatus.INSTALLED ? (
            <PlayGameButton
              ref={forwardedRef}
              {...rest}
              className={cn(buttonClasses)}
              variant="accent"
            />
          ) : (
            <InstallGameButton
              ref={forwardedRef}
              disabled={status !== "success"}
              {...rest}
              className={cn(buttonClasses)}
              variant="accent"
            />
          )
        }
        web={
          <DownloadGameButton
            ref={forwardedRef}
            {...rest}
            className={cn(buttonClasses)}
            game={game}
          />
        }
      />
    );
  },
);
