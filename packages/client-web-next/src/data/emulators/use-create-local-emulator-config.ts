import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emulatorQueryKeys } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { CreateLocalEmulatorConfigRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { LocalEmulatorConfig } from "@retrom/codegen/retrom/services/emulators/v1/local_emulator_config_pb";
import { useRetromClient } from "@/api-client/context";

export function useCreateLocalEmulatorConfig() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    LocalEmulatorConfig,
    ConnectError,
    MessageInitShape<typeof CreateLocalEmulatorConfigRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.emulatorClient.createLocalEmulatorConfig(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: emulatorQueryKeys.all(),
      });
    },
  });
}
