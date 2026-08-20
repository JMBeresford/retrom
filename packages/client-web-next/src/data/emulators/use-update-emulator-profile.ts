import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emulatorQueryKeys } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { UpdateEmulatorProfileRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { EmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";
import { useRetromClient } from "@/api-client/context";

export function useUpdateEmulatorProfile() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    EmulatorProfile,
    ConnectError,
    MessageInitShape<typeof UpdateEmulatorProfileRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.emulatorClient.updateEmulatorProfile(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: emulatorQueryKeys.all(),
      });
    },
  });
}
