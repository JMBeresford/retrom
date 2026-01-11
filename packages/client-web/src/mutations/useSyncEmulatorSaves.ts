import { RawMessage } from "@/utils/protos";
import {
  SyncEmulatorSavesPayload,
  SyncEmulatorSavesResponse,
} from "@retrom/codegen/retrom/client/saves_pb";
import {
  SaveManagerError,
  syncEmulatorSaves,
} from "@retrom/plugin-save-manager";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => syncEmulatorSaves(payload),
    onSettled: () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["stat-save-files", "emulator-save-sync-status"].some((key) =>
            query.queryKey.includes(key),
          ),
      }),
    ...opts,
  });
}
