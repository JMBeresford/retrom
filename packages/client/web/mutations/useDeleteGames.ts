import { Game } from "@/generated/retrom/models/games";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteGames(games: Game[]) {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteGames", games],
    mutationFn: async () =>
      retromClient.gameClient.deleteGames({
        ids: games.map((game) => game.id),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "games",
          "game-metadata",
          "library",
          ...games.map((g) => g.id),
        ],
      });
    },
  });
}
