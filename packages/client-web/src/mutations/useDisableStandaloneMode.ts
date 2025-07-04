import { useConfigStore } from "@/providers/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disableStandaloneMode } from "@retrom/plugin-standalone";

export function useDisableStandaloneMode() {
  const configStore = useConfigStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["disable-standalone-mode"],
    mutationFn: async () => {
      await disableStandaloneMode();

      configStore.setState((store) => {
        store.server = undefined;

        return { ...store };
      });

      await queryClient.invalidateQueries();
    },
    onError: console.error,
  });
}
