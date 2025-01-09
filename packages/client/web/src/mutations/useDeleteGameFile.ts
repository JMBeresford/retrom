import { DeleteGameFilesRequest } from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteGameFiles() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["delete-game-files"],
    mutationFn: (request: DeleteGameFilesRequest) =>
      retromClient.gameClient.deleteGameFiles(request),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["game-file", "game-files"].some((k) => query.queryKey.includes(k)),
      });
    },
  });
}
