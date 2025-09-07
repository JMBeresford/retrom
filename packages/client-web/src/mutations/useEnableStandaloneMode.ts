import { useConfigStore } from "@/providers/config";
import { useMutation } from "@tanstack/react-query";
import { enableStandaloneMode } from "@retrom/plugin-standalone";

export function useEnableStandaloneMode() {
  const configStore = useConfigStore();

  return useMutation({
    mutationKey: ["enable-standalone-mode"],
    mutationFn: async () => {
      const { ip = "127.0.0.1", port } = (await enableStandaloneMode()) ?? {};

      if (!port) {
        return;
      }

      const hostname = `http://${ip}`;

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
