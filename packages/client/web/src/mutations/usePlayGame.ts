import { Game } from "@/generated/retrom/models/games";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { PlayGamePayload } from "@/generated/retrom/client/client-utils";

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
      queryClient.invalidateQueries({
        queryKey: ["play-status", game?.id],
      });
    },
  });
}
