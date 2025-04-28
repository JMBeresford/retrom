import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils";
import { ActionButton } from "../../../../../../components/action-button";
import { useGameDetail } from "@/providers/game-details";
import { Link } from "@tanstack/react-router";
import { openInstallationDir } from "@retrom/plugin-installer";
import { Fragment, useMemo } from "react";
import {
  Emulator,
  EmulatorProfile,
} from "@retrom/codegen/retrom/models/emulators";
import { Badge } from "@/components/ui/badge";
import { usePlayGame } from "@/mutations/usePlayGame";

export function Actions() {
  const { game, validEmulators, validProfiles, defaultProfile, gameFiles } =
    useGameDetail();

  const { data: installationState } = useInstallationQuery(game);
  const { mutate: playGame } = usePlayGame(game);

  const playWithOptions = useMemo(() => {
    return validProfiles.reduce(
      (map, profile) => {
        const emulator = validEmulators?.find(
          (e) => e.id === profile.emulatorId,
        );

        if (emulator) {
          if (!map[emulator.id]) {
            map[emulator.id] = { emulator, profiles: [] };
          }

          map[emulator.id].profiles.push(profile);
        }

        return map;
      },
      {} as Record<number, { emulator: Emulator; profiles: EmulatorProfile[] }>,
    );
  }, [validEmulators, validProfiles]);

  return (
    <div
      className={cn(
        "flex relative",
        "[&_*[data-radix-popper-content-wrapper]]:contents sm:[&_*[data-radix-popper-content-wrapper]]:block",
      )}
    >
      <div
        className={cn(
          "w-full *:w-full rounded-l-lg sm:rounded-tl-none overflow-hidden border-r-2",
          installationState === InstallationStatus.INSTALLING && "bg-primary",
        )}
      >
        <ActionButton
          game={game}
          className='[&_div[role="progressbar"]]:w-[85%] [&_div[role="progressbar"]_>_*]:bg-primary-foreground w-full'
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="accent"
            className="rounded-none rounded-r-lg sm:rounded-tr-none overflow-hidden ring-inset"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          portal={false}
          align="start"
          className="absolute inset-x-0 top-full mt-2 sm:mt-0"
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={
                installationState !== InstallationStatus.INSTALLED ||
                validEmulators?.length === 0 ||
                validProfiles.length === 0
              }
            >
              Play with
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {Object.values(playWithOptions).map(({ emulator, profiles }) => (
                <Fragment key={emulator.id}>
                  <DropdownMenuLabel>{emulator.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {profiles.map((emulatorProfile) => (
                    <DropdownMenuItem
                      key={emulatorProfile.id}
                      onClick={() => {
                        const file = gameFiles?.find(
                          (file) => file.id === game.defaultFileId,
                        );

                        playGame({ emulator, emulatorProfile, game, file });
                      }}
                    >
                      {emulatorProfile.name}{" "}
                      {emulatorProfile.id === defaultProfile?.id ? (
                        <Badge variant="outline" className="ml-4">
                          default
                        </Badge>
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </Fragment>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link search={{ updateMetadataModal: { open: true } }}>Edit</Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={installationState !== InstallationStatus.INSTALLED}
            onSelect={() => openInstallationDir(game.id)}
          >
            Show Files
          </DropdownMenuItem>

          {installationState === InstallationStatus.INSTALLED && (
            <DropdownMenuItem asChild>
              <Link search={{ uninstallGameModal: { open: true } }}>
                Uninstall
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              className="text-destructive-text"
              search={{ deleteGameModal: { open: true } }}
            >
              Delete
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
