import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateServerConfigRequestSchema } from "@retrom/codegen/retrom/services/server-service_pb";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useUpdateServerConfig() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      req: MessageInitShape<typeof UpdateServerConfigRequestSchema>,
    ) => retromClient.serverClient.updateServerConfig(req),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("server-config"),
      });
    },
  });
}
