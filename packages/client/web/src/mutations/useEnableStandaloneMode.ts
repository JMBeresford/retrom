import { useConfigStore } from "@/providers/config";
import { useMutation } from "@tanstack/react-query";
import { enableStandaloneMode } from "retrom-plugin-standalone-api";

export function useEnableStandaloneMode() {
  const configStore = useConfigStore();

  return useMutation({
    mutationKey: ["enable-standalone-mode"],
    mutationFn: async () => {
      const port = await enableStandaloneMode();

      console.log({ port });

      if (!port) {
        return;
      }

      configStore.setState((store) => {
        store.config.standalone = true;
        store.server.port = port;
        store.server.hostname = "http://localhost";

        return store;
      });

      console.log("Standalone mode enabled on port", port);
    },
    onError: console.error,
  });
}
