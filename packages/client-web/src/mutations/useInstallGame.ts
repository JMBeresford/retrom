import { installGame } from "@retrom/plugin-installer";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useInstallGame(game: Game) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["installation", game.path],
    mutationFn: () => installGame({ gameId: game.id }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["installation-index"],
      });
    },
    onError: console.error,
  });

  return mutation;
}
