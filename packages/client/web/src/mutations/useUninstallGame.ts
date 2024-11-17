import { useToast } from "@/components/ui/use-toast";
import { Game } from "@/generated/retrom/models/games";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export function useUninstallGame(game: Game) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["uninstall", game.path],
    mutationFn: async () => {
      return invoke("plugin:installer|uninstall_game", {
        payload: { game },
      });
    },
    onSuccess: () => {
      toast({
        title: "Game uninstalled",
        description: `Game was successfully uninstalled`,
      });

      queryClient.invalidateQueries({
        queryKey: ["installation-state"],
      });
    },
  });
}
