import { abortInstallation } from "@retrom/plugin-installer";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAbortInstallation(gameId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["abort-installation", gameId],
    mutationFn: () => abortInstallation(gameId),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["installation-index"],
      });
    },
    onError: console.error,
  });

  return mutation;
}
