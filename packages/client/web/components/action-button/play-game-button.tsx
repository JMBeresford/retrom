import { Button } from "@/components/ui/button";
import { useGameDetail } from "../../app/games/[id]/game-details-context";
import { usePlayGame } from "@/mutations/usePlayGame";
import { useEmulatorProfiles } from "@/queries/useEmulatorProfiles";
import { usePlayStatusQuery } from "@/queries/usePlayStatus";
import { PlayStatus } from "@/generated/retrom/client/client-utils";
import { useStopGame } from "@/mutations/useStopGame";
import { useDefaultEmulatorProfiles } from "@/queries/useDefaultEmulatorProfiles";
import { ComponentProps } from "react";
import { LoaderCircleIcon, PlayIcon, Square } from "lucide-react";
import { useEmulators } from "@/queries/useEmulators";

export function PlayGameButton(props: ComponentProps<typeof Button>) {
  const { game, platform } = useGameDetail();
  const { mutate: playAction } = usePlayGame(game);
  const { mutate: stopAction } = useStopGame(game);

  const { data: playStatusUpdate, status: queryStatus } =
    usePlayStatusQuery(game);

  const { data: defaultProfileId } = useDefaultEmulatorProfiles({
    request: { platformIds: [platform.id] },
    selectFn: (data) => data.defaultProfiles.at(0)?.emulatorProfileId,
  });

  const { data: emulator, status: emulatorsStatus } = useEmulators({
    request: { supportedPlatformIds: [platform.id] },
    selectFn: (data) => data.emulators.at(0),
  });

  const { data: profiles } = useEmulatorProfiles({
    enabled: emulatorsStatus === "success",
    selectFn: (data) => data.profiles,
    request: {
      ids: defaultProfileId !== undefined ? [defaultProfileId] : [],
      emulatorIds: emulator ? [emulator.id] : [],
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

  return (
    <Button
      {...props}
      disabled={!defaultProfile || !emulator}
      onClick={() => {
        playAction({
          game,
          emulatorProfile: defaultProfile,
          emulator: emulator!,
        });
      }}
    >
      <PlayIcon className="h-[1.2rem] w-[1.2rem] fill-current" />
      Play
    </Button>
  );
}
