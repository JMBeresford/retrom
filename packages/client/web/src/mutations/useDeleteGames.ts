import { DeleteGamesRequestSchema } from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useDeleteGames() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-games"],
    mutationFn: async (
      request: MessageInitShape<typeof DeleteGamesRequestSchema>,
    ) => {
      const response = await retromClient.gameClient.deleteGames(request);
      return response;
    },
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
