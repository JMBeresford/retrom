import { CreateLocalEmulatorConfigsRequest } from "@retrom/codegen/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateLocalEmulatorConfigs() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: (request: CreateLocalEmulatorConfigsRequest) =>
      retromClient.emulatorClient.createLocalEmulatorConfigs(request),
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
