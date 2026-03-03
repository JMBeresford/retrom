import { useQuery } from "@tanstack/react-query";
import { getEmulatorSaveStatesSyncStatus } from "@retrom/plugin-save-manager";

export function useEmulatorSaveStatesSyncStatus(emulatorId?: number) {
  return useQuery({
    enabled: emulatorId !== undefined,
    queryFn: () => getEmulatorSaveStatesSyncStatus(emulatorId ?? NaN),
    queryKey: ["emulator-save-states-sync-status", emulatorId],
  });
}
