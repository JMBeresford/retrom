import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emulatorQueryKeys } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { DeleteDefaultEmulatorProfileRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { Empty } from "@bufbuild/protobuf/wkt";
import { useRetromClient } from "@/api-client/context";

export function useDeleteDefaultEmulatorProfile() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    Empty,
    ConnectError,
    MessageInitShape<typeof DeleteDefaultEmulatorProfileRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.emulatorClient.deleteDefaultEmulatorProfile(request),
    onSuccess: async (_, request) => {
      await queryClient.invalidateQueries({
        queryKey: emulatorQueryKeys.getDefaultEmulatorProfile({
          id: request.id,
        }),
      });

      await queryClient.invalidateQueries({
        queryKey: emulatorQueryKeys.listAllDefaultEmulatorProfiles(),
      });
    },
  });
}
