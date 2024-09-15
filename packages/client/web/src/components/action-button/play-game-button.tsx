import { Button } from "@/components/ui/button";
import { usePlayGame } from "@/mutations/usePlayGame";
import { useEmulatorProfiles } from "@/queries/useEmulatorProfiles";
import { usePlayStatusQuery } from "@/queries/usePlayStatus";
import { PlayStatus } from "@/generated/retrom/client/client-utils";
import { useStopGame } from "@/mutations/useStopGame";
import { useDefaultEmulatorProfiles } from "@/queries/useDefaultEmulatorProfiles";
import { ComponentProps } from "react";
import { LoaderCircleIcon, PlayIcon, Square } from "lucide-react";
import { useEmulators } from "@/queries/useEmulators";
import { useGameDetail } from "@/providers/game-details";

export function PlayGameButton(props: ComponentProps<typeof Button>) {
  const { game, platform } = useGameDetail();
  const { mutate: playAction } = usePlayGame(game);
  const { mutate: stopAction } = useStopGame(game);

  const { data: playStatusUpdate, status: queryStatus } =
    usePlayStatusQuery(game);

  const { data: defaultProfileId, status: defaultEmulatorProfileStatus } =
    useDefaultEmulatorProfiles({
      request: { platformIds: [platform.id] },
      selectFn: (data) => data.defaultProfiles.at(0)?.emulatorProfileId,
    });

  const { data: emulators, status: emulatorsStatus } = useEmulators({
    request: { supportedPlatformIds: [platform.id] },
    selectFn: (data) => data.emulators,
  });

  const { data: profiles } = useEmulatorProfiles({
    enabled:
      emulatorsStatus === "success" &&
      defaultEmulatorProfileStatus === "success",
    selectFn: (data) => data.profiles,
    request: {
      ids: defaultProfileId !== undefined ? [defaultProfileId] : [],
      emulatorIds: emulators?.map((emulator) => emulator.id) ?? [],
    },
  });

  if (queryStatus === "pending") {
    return (
      <Button {...props} disabled>
        <LoaderCircleIcon className="h-[1.2rem] w-[1.2rem]" />
        Launching...
      </Button>
    );
  }

  if (playStatusUpdate?.playStatus === PlayStatus.PLAYING) {
    return (
      <Button {...props} onClick={() => stopAction({ game })}>
        <Square className="h-[1.2rem] w-[1.2rem] fill-current" />
        Stop
      </Button>
    );
  }

  const defaultProfile =
    profiles?.find((profile) => profile.id === defaultProfileId) ??
    profiles?.at(0);

  const emulator = defaultProfile
    ? emulators?.find((emulator) => emulator.id === defaultProfile.emulatorId)
    : emulators?.at(0);

  return (
    <Button
      {...props}
      disabled={!defaultProfile || !emulator}
      onClick={() => {
        if (!defaultProfile || !emulator) return;

        playAction({
          game,
          emulatorProfile: defaultProfile,
          emulator: emulator,
        });
      }}
    >
      <PlayIcon className="h-[1.2rem] w-[1.2rem] fill-current" />
      Play
    </Button>
  );
}
