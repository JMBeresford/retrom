import { UpdateGameFilesRequest } from "@retrom/codegen/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateGameFiles() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["update-game-files"],
    mutationFn: (request: UpdateGameFilesRequest) =>
      retromClient.gameClient.updateGameFiles(request),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["game-file", "game-files"].some((k) => query.queryKey.includes(k)),
      });
    },
  });
}
