import type { UpdateGamesRequest } from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateGames() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["update-games"],
    mutationFn: (request: UpdateGamesRequest) =>
      retromClient.gameClient.updateGames(request),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["game", "games"].some((k) => query.queryKey.includes(k)),
      });
    },
  });
}
