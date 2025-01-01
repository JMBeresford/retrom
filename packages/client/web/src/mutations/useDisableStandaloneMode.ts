import { useConfigStore } from "@/providers/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disableStandaloneMode } from "retrom-plugin-standalone-api";

export function useDisableStandaloneMode() {
  const configStore = useConfigStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["disable-standalone-mode"],
    mutationFn: async () => {
      await disableStandaloneMode();

      configStore.setState((store) => {
        store.server = {
          ...store.server,
          standalone: false,
        };

        return { ...store };
      });
    },
    onSuccess: () => {
      queryClient.resetQueries();
    },
    onError: console.error,
  });
}
