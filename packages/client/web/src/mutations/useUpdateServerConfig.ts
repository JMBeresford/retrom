import { ServerConfig } from "@retrom/codegen/retrom/server/config_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RawMessage } from "@/utils/protos";

export function useUpdateServerConfig() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: RawMessage<ServerConfig>) =>
      retromClient.serverClient.updateServerConfig({ config }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("server-config"),
      });
    },
  });
}
