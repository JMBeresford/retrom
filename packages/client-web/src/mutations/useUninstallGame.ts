import { useToast } from "@retrom/ui/hooks/use-toast";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uninstallGame } from "@retrom/plugin-installer";

export function useUninstallGame(game: Game) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["uninstall", game.path],
    mutationFn: () => uninstallGame({ gameId: game.id }),
    onSuccess: () => {
      toast({
        title: "Game uninstalled",
        description: `Game was successfully uninstalled`,
      });

      return queryClient.invalidateQueries({
        queryKey: ["installation-index"],
      });
    },
  });
}
