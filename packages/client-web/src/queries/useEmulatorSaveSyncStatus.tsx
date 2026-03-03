import { useQuery } from "@tanstack/react-query";
import { getEmulatorSavesSyncStatus } from "@retrom/plugin-save-manager";

export function useEmulatorSaveSyncStatus(emulatorId?: number) {
  return useQuery({
    enabled: emulatorId !== undefined,
    queryFn: () => getEmulatorSavesSyncStatus(emulatorId ?? NaN),
    queryKey: ["emulator-save-sync-status", emulatorId],
  });
}
