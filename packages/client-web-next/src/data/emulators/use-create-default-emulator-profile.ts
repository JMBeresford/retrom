import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emulatorQueryKeys } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { CreateDefaultEmulatorProfileRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { DefaultEmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/default_emulator_profile_pb";
import { useRetromClient } from "@/api-client/context";

export function useCreateDefaultEmulatorProfile() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    DefaultEmulatorProfile,
    ConnectError,
    MessageInitShape<typeof CreateDefaultEmulatorProfileRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.emulatorClient.createDefaultEmulatorProfile(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: emulatorQueryKeys.all(),
      });
    },
  });
}
