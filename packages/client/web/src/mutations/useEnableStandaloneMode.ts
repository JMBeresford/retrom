import { useConfigStore } from "@/providers/config";
import { useMutation } from "@tanstack/react-query";
import { enableStandaloneMode } from "retrom-plugin-standalone-api";

export function useEnableStandaloneMode() {
  const configStore = useConfigStore();

  return useMutation({
    mutationKey: ["enable-standalone-mode"],
    mutationFn: async () => {
      const { ip: hostname = "http://localhost", port } =
        (await enableStandaloneMode()) ?? {};

      if (!port) {
        return;
      }

      configStore.setState((store) => {
        store.server = {
          ...store.server,
          standalone: true,
          hostname,
          port,
        };

        return { ...store };
      });
    },

    onError: console.error,
  });
}
