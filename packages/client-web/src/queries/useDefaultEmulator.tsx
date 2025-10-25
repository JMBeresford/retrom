import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { useEmulatorProfiles } from "./useEmulatorProfiles";
import { useEmulators } from "./useEmulators";
import { usePlatforms } from "./usePlatforms";
import { checkIsDesktop } from "@/lib/env";
import { Emulator_OperatingSystem } from "@retrom/codegen/retrom/models/emulators_pb";
import { useDefaultEmulatorProfiles } from "./useDefaultEmulatorProfiles";
import { useQuery } from "@tanstack/react-query";

export function useDefaultEmulator(game: Game) {
  const { data: platform, status: platformStatus } = usePlatforms({
    request: {
      ids: game.platformId !== undefined ? [game.platformId] : [-1],
    },
    selectFn: (data) => data.platforms.find((p) => p.id === game.platformId),
  });

  const { data: emulators, status: emulatorsStatus } = useEmulators({
    enabled: platformStatus === "success",
    request: {
      ids: [],
      supportedPlatformIds: platform?.id !== undefined ? [platform.id] : [-1],
    },
    selectFn: (data) =>
      data.emulators.filter(
        (e) =>
          checkIsDesktop() ||
          e.operatingSystems.includes(Emulator_OperatingSystem.WASM),
      ),
  });

  const { data: defaultProfileId, status: defaultEmulatorProfileStatus } =
    useDefaultEmulatorProfiles({
      enabled: platformStatus === "success",
      request: {
        platformIds: platform?.id !== undefined ? [platform.id] : [-1],
      },
      selectFn: (data) => data.defaultProfiles.at(0)?.emulatorProfileId,
    });

  const { data: profiles, status: profilesStatus } = useEmulatorProfiles({
    enabled:
      emulatorsStatus === "success" &&
      defaultEmulatorProfileStatus === "success",
    selectFn: (data) => data.profiles,
    request: {
      ids: [],
      emulatorIds: emulators?.length
        ? emulators.map((emulator) => emulator.id)
        : [-1],
    },
  });

  return useQuery({
    queryKey: ["default-emulator", game.id],
    enabled:
      profilesStatus === "success" &&
      defaultEmulatorProfileStatus === "success" &&
      emulatorsStatus === "success",
    queryFn: () => {
      const defaultProfile =
        profiles?.find((profile) => profile.id === defaultProfileId) ??
        profiles?.at(0);

      const emulator = defaultProfile
        ? emulators?.find(
            (emulator) => emulator.id === defaultProfile.emulatorId,
          )
        : emulators?.at(0);

      return { emulator, defaultProfile };
    },
  });
}
