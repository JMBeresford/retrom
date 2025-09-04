import { Button } from "@retrom/ui/components/button";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import { PlatformDependent } from "@/lib/env";
import { cn } from "@retrom/ui/lib/utils";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { PlayGameButton } from "./play-game-button";
import { InstallGameButton } from "./install-game-button";
import { ComponentProps, ForwardedRef, forwardRef } from "react";
import { DownloadGameButton } from "./download-game-button";
import { useGameDetail } from "@/providers/game-details";
import { Emulator_OperatingSystem } from "@retrom/codegen/retrom/models/emulators_pb";
import { Link } from "@tanstack/react-router";
import { PlayIcon } from "lucide-react";

export const ActionButton = forwardRef(
  (
    props: ComponentProps<typeof Button>,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { game, emulator } = useGameDetail();
    const { className, ...rest } = props;
    const installationState = useInstallationQuery(game);

    const buttonClasses = cn(
      "rounded-none font-bold text-lg tracking-wider flex gap-2 items-center",
      className,
    );

    const isPlayableInWeb =
      emulator?.libretroName &&
      emulator.operatingSystems.includes(Emulator_OperatingSystem.WASM);

    return (
      <PlatformDependent
        desktop={
          installationState === InstallationStatus.INSTALLED ||
          isPlayableInWeb ? (
            <PlayGameButton
              ref={forwardedRef}
              {...rest}
              className={cn(buttonClasses)}
              variant="accent"
            />
          ) : (
            <InstallGameButton
              ref={forwardedRef}
              {...rest}
              className={cn(buttonClasses)}
              variant="accent"
            />
          )
        }
        web={
          isPlayableInWeb ? (
            <Link to="/play/$gameId" params={{ gameId: game.id.toString() }}>
              <Button variant="accent" className={cn(buttonClasses)}>
                <PlayIcon className="h-[1.2rem] w-[1.2rem] fill-current" />
                Play
              </Button>
            </Link>
          ) : (
            <DownloadGameButton
              ref={forwardedRef}
              {...rest}
              className={cn(buttonClasses)}
              game={game}
            />
          )
        }
      />
    );
  },
);
