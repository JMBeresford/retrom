import { UpdateLocalEmulatorConfigsRequest } from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateLocalEmulatorConfig() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: (request: UpdateLocalEmulatorConfigsRequest) =>
      retromClient.emulatorClient.updateLocalEmulatorConfigs(request),
    mutationKey: ["update-local-emulator-configs"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["local-emulator-configs"].some((v) => query.queryKey.includes(v)),
      });
    },
  });
}