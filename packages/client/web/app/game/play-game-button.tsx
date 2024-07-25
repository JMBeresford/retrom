import { Button } from "@/components/ui/button";
import { useGameDetail } from "./game-context";
import { usePlayGame } from "@/mutations/usePlayGame";
import { useEmulatorProfiles } from "@/queries/useEmulatorProfiles";
import { useEmulators } from "@/queries/useEmulators";
import { usePlayStatusQuery } from "@/queries/usePlayStatus";
import { PlayStatus } from "@/generated/retrom/client-utils";
import { useStopGame } from "@/mutations/useStopGame";
import { useDefaultEmulatorProfiles } from "@/queries/useDefaultEmulatorProfiles";

export function PlayGameButton() {
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
      <Button className="rounded-none" disabled>
        Launching...
      </Button>
    );
  }

  if (playStatusUpdate?.playStatus === PlayStatus.PLAYING) {
    return (
      <Button className="rounded-none" onClick={() => stopAction({ game })}>
        Stop
      </Button>
    );
  }

  return (
    <Button
      className="rounded-none"
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
      Play
    </Button>
  );
}
