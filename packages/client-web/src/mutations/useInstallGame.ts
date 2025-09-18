import { installGame } from "@retrom/plugin-installer";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useInstallGame(gameId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["install-game", gameId],
    mutationFn: () => installGame({ gameId: gameId }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["installation-index"],
      });
    },
    onError: console.error,
  });

  return mutation;
}
