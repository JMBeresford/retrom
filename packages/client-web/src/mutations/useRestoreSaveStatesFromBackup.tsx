import { useRetromClient } from "@/providers/retrom-client";
import { RawMessage } from "@/utils/protos";
import {
  RestoreSaveStatesFromBackupRequest,
  RestoreSaveStatesFromBackupResponse,
} from "@retrom/codegen/retrom/services/saves/v2/emulator-saves-service_pb";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export function useRestoreSaveStatesFromBackup(
  opts?: Omit<
    UseMutationOptions<
      RestoreSaveStatesFromBackupResponse,
      Error,
      RawMessage<RestoreSaveStatesFromBackupRequest>
    >,
    "mutationFn"
  >,
) {
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: async (request) =>
      await retromClient.emulatorSavesClient.restoreSaveStatesFromBackup(
        request,
      ),
    ...opts,
  });
}
