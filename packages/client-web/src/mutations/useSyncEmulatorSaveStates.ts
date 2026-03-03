import { RawMessage } from "@/utils/protos";
import {
  SyncEmulatorSaveStatesPayload,
  SyncEmulatorSaveStatesResponse,
} from "@retrom/codegen/retrom/client/saves_pb";
import {
  SaveManagerError,
  syncEmulatorSaveStates,
} from "@retrom/plugin-save-manager";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";

export function useSyncEmulatorSaveStates(
  opts?: Omit<
    UseMutationOptions<
      SyncEmulatorSaveStatesResponse,
      SaveManagerError | Error,
      RawMessage<SyncEmulatorSaveStatesPayload>
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => syncEmulatorSaveStates(payload),
    onSettled: () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["stat-save-states", "emulator-save-states-sync-status"].some((key) =>
            query.queryKey.includes(key),
          ),
      }),
    ...opts,
  });
}
