import { Game } from "@/generated/retrom/models/games";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export function useUninstallGame(game: Game) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["uninstall", game.path],
    mutationFn: async () => {
      return invoke("plugin:installer|uninstall_game", {
        payload: { game },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["installation-state"],
      });
    },
  });
}
