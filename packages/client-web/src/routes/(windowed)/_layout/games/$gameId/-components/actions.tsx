import { Button } from "@retrom/ui/components/button";
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
} from "@retrom/ui/components/dropdown-menu";
import { cn } from "@retrom/ui/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils_pb";
import { ActionButton } from "../../../../../../components/action-button";
import { useGameDetail } from "@/providers/game-details";
import { Link } from "@tanstack/react-router";
import { openInstallationDir } from "@retrom/plugin-installer";
import { Fragment, useMemo } from "react";
import {
  Emulator,
  Emulator_OperatingSystem,
  EmulatorProfile,
} from "@retrom/codegen/retrom/models/emulators_pb";
import { Badge } from "@retrom/ui/components/badge";
import { usePlayGame } from "@/mutations/usePlayGame";
import { checkIsDesktop } from "@/lib/env";
import { useNavigate } from "@tanstack/react-router";
import { Core } from "@/lib/emulatorjs";

export function Actions() {
  const { game, validEmulators, validProfiles, defaultProfile, gameFiles } =
    useGameDetail();

  const { data: installationState } = useInstallationQuery(game);
  const { mutate: playGame } = usePlayGame(game);
  const navigate = useNavigate();

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
        <ActionButton className='[&_div[role="progressbar"]]:w-[85%] [&_div[role="progressbar"]_>_*]:bg-primary-foreground w-full' />
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
                validEmulators?.length === 0 || validProfiles.length === 0
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
                      disabled={
                        checkIsDesktop() &&
                        installationState !== InstallationStatus.INSTALLED &&
                        !emulator.operatingSystems.includes(
                          Emulator_OperatingSystem.WASM,
                        )
                      }
                      onClick={async () => {
                        const file = gameFiles?.find(
                          (file) => file.id === game.defaultFileId,
                        );

                        if (
                          !checkIsDesktop() &&
                          emulator.libretroName &&
                          emulator.operatingSystems?.includes(
                            Emulator_OperatingSystem.WASM,
                          )
                        ) {
                          const coreName = emulator.libretroName as
                            | Core
                            | undefined;

                          if (coreName) {
                            return await navigate({
                              to: "/play/$gameId",
                              params: { gameId: game.id.toString() },
                              search: { coreName },
                            }).catch(console.error);
                          }
                        }

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
            <Link to="." search={{ updateMetadataModal: { open: true } }}>
              Edit
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={installationState !== InstallationStatus.INSTALLED}
            onSelect={() => openInstallationDir(game.id)}
          >
            Show Files
          </DropdownMenuItem>

          {installationState === InstallationStatus.INSTALLED && (
            <DropdownMenuItem asChild>
              <Link to="." search={{ uninstallGameModal: { open: true } }}>
                Uninstall
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              to="."
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
