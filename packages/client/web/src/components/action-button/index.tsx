import { Button } from "@/components/ui/button";
import { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils";
import { Game } from "@retrom/codegen/retrom/models/games";
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
    const { data: installationState, status } = useInstallationQuery(game);

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
