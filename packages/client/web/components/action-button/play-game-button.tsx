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

export function PlayGameButton(props: ComponentProps<typeof Button>) {
  const { game, platform } = useGameDetail();
  const { mutate: playAction } = usePlayGame(game);
  const { mutate: stopAction } = useStopGame(game);

  const { data: playStatusUpdate, status: queryStatus } =
    usePlayStatusQuery(game);

  const { data: profile } = useDefaultEmulatorProfiles({
    request: { platformIds: [platform.id] },
    selectFn: (data) => data.defaultProfiles.at(0),
  });

  const emulatorProfilesQuery = useEmulatorProfiles({
    enabled: profile?.emulatorProfileId !== undefined,
    selectFn: (data) => data.profiles,
    request: {
      ids:
        profile?.emulatorProfileId !== undefined
          ? [profile.emulatorProfileId]
          : [],
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

  return (
    <Button
      {...props}
      disabled={!profile}
      onClick={() => {
        const emulatorProfile = emulatorProfilesQuery.data?.at(0);
        if (!emulatorProfile) {
          return;
        }

        playAction({
          game,
          emulatorProfile,
        });
      }}
    >
      <PlayIcon className="h-[1.2rem] w-[1.2rem] fill-current" />
      Play
    </Button>
  );
}
