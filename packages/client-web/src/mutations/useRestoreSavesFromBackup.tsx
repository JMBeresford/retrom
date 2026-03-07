import { useRetromClient } from "@/providers/retrom-client";
import { RawMessage } from "@/utils/protos";
import {
  RestoreSaveFilesFromBackupRequest,
  RestoreSaveFilesFromBackupResponse,
} from "@retrom/codegen/retrom/services/saves/v2/emulator-saves-service_pb";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export function useRestoreSavesFromBackup(
  opts?: Omit<
    UseMutationOptions<
      RestoreSaveFilesFromBackupResponse,
      Error,
      RawMessage<RestoreSaveFilesFromBackupRequest>
    >,
    "mutationFn"
  >,
) {
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: async (request) =>
      await retromClient.emulatorSavesClient.restoreSaveFilesFromBackup(
        request,
      ),
    ...opts,
  });
}
