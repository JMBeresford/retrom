import { ServerConfig } from "@/generated/retrom/server/config";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateServerConfig() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: ServerConfig) =>
      retromClient.serverClient.updateServerConfig({ config }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("server-config"),
      });
    },
  });
}
