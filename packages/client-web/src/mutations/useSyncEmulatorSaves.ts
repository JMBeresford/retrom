import { RawMessage } from "@/utils/protos";
import {
  SyncEmulatorSavesPayload,
  SyncEmulatorSavesResponse,
} from "@retrom/codegen/retrom/client/saves_pb";
import {
  SaveManagerError,
  syncEmulatorSaves,
} from "@retrom/plugin-save-manager";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export function useSyncEmulatorSaves(
  opts?: Omit<
    UseMutationOptions<
      SyncEmulatorSavesResponse,
      SaveManagerError | Error,
      RawMessage<SyncEmulatorSavesPayload>
    >,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: async (payload) => syncEmulatorSaves(payload),
    ...opts,
  });
}
