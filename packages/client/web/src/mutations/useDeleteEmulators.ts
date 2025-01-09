import { DeleteEmulatorsRequest } from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteEmulators(opts: { key?: string | number } = {}) {
  const { key } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: (request: DeleteEmulatorsRequest) =>
      retromClient.emulatorClient.deleteEmulators(request),
    mutationKey: ["delete-emulator", key],
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["emulators", "emulator"].some((v) => query.queryKey.includes(v)),
      });
    },
  });
}
