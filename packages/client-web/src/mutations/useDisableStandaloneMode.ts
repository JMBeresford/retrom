import { useConfigStore } from "@/providers/config";
import { useMutation } from "@tanstack/react-query";
import { disableStandaloneMode } from "@retrom/plugin-standalone";

export function useDisableStandaloneMode() {
  const configStore = useConfigStore();

  return useMutation({
    mutationKey: ["disable-standalone-mode"],
    mutationFn: async () => {
      await disableStandaloneMode();

      configStore.setState((store) => {
        store.server = undefined;

        return { ...store };
      });
    },
    onError: console.error,
  });
}
