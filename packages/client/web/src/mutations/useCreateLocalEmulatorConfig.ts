import { CreateLocalEmulatorConfigsRequestSchema } from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useCreateLocalEmulatorConfigs() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof CreateLocalEmulatorConfigsRequestSchema>,
    ) => retromClient.emulatorClient.createLocalEmulatorConfigs(request),
    mutationKey: ["create-local-emulator-configs", queryClient],
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["local-emulator-configs"].some((v) => query.queryKey.includes(v)),
      });
    },
  });
}
