import { UpdateLocalEmulatorConfigsRequestSchema } from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useUpdateLocalEmulatorConfig() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof UpdateLocalEmulatorConfigsRequestSchema>,
    ) => retromClient.emulatorClient.updateLocalEmulatorConfigs(request),
    mutationKey: ["update-local-emulator-configs"],
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["local-emulator-configs"].some((v) => query.queryKey.includes(v)),
      });
    },
  });
}
