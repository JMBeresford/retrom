import { ServerConfigSchema } from "@retrom/codegen/retrom/server/config_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useUpdateServerConfig() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: MessageInitShape<typeof ServerConfigSchema>) =>
      retromClient.serverClient.updateServerConfig({ config }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("server-config"),
      });
    },
  });
}
