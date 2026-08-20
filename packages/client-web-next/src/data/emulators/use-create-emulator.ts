import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emulatorQueryKeys } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { CreateEmulatorRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import { useRetromClient } from "@/api-client/context";

export function useCreateEmulator() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    Emulator,
    ConnectError,
    MessageInitShape<typeof CreateEmulatorRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.emulatorClient.createEmulator(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: emulatorQueryKeys.all(),
      });
    },
  });
}
