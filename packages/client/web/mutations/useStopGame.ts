import { StopGamePayload } from "@/generated/retrom/client-utils";
import { Game } from "@/generated/retrom/models/games";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export function useStopGame(game?: Game) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["stop", game?.id],
    mutationFn: async (payload: StopGamePayload) => {
      return invoke("plugin:launcher|stop_game", {
        payload,
      });
    },
    onError: console.error,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["play-status", game?.id],
      });
    },
  });
}
