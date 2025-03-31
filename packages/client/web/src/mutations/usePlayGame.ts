import { Game } from "@retrom/codegen/retrom/models/games";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { PlayGamePayload } from "@retrom/codegen/retrom/client/client-utils";

export function usePlayGame(game?: Game) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["play", game?.id],
    mutationFn: async (payload: PlayGamePayload) =>
      invoke("plugin:launcher|play_game", {
        payload,
      }),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["play-status", game?.id],
      });
    },
  });
}
