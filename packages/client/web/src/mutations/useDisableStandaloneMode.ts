import { useConfigStore } from "@/providers/config";
import { useMutation } from "@tanstack/react-query";
import { disableStandaloneMode } from "retrom-plugin-standalone-api";

export function useDisableStandaloneMode() {
  const configStore = useConfigStore();

  return useMutation({
    mutationKey: ["disable-standalone-mode"],
    mutationFn: async () => {
      await disableStandaloneMode();

      configStore.setState((store) => {
        store.config.standalone = false;

        return store;
      });

      console.log("Standalone mode disabled");
    },
    onError: console.error,
  });
}
