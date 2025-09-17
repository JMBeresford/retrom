import { installGame } from "@retrom/plugin-installer";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useInstallGame() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["install-game"],
    mutationFn: (gameId: number) => installGame({ gameId: gameId }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["installation-index"],
      });
    },
    onError: console.error,
  });

  return mutation;
}
