import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emulatorQueryKeys } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { UpdateLocalEmulatorConfigRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { LocalEmulatorConfig } from "@retrom/codegen/retrom/services/emulators/v1/local_emulator_config_pb";
import { useRetromClient } from "@/api-client/context";

export function useUpdateLocalEmulatorConfig() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    LocalEmulatorConfig,
    ConnectError,
    MessageInitShape<typeof UpdateLocalEmulatorConfigRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.emulatorClient.updateLocalEmulatorConfig(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: emulatorQueryKeys.all(),
      });
    },
  });
}
