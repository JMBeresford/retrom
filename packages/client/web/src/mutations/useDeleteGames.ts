import { DeleteGamesRequest } from "@retrom/codegen/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteGames() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-games"],
    mutationFn: async (request: DeleteGamesRequest) =>
      retromClient.gameClient.deleteGames(request),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["game", "games", "game-metadata", "game-files"].some((k) =>
            query.queryKey.includes(k),
          ),
      });
    },
  });
}
