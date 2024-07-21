import { Game } from "@/generated/retrom/models/games";
import { EmulatorProfile } from "@/generated/retrom/models/emulators";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export function usePlayGame(game?: Game) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["play", game?.id],
    mutationFn: async (payload: {
      game: Game;
      emulatorProfile: EmulatorProfile;
    }) => {
      return invoke("plugin:launcher|play_game", {
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
