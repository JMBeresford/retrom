import { useMutation, useQueryClient } from "@tanstack/react-query";
import { configQueryKeys } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { UpdateServerConfigRequestSchema } from "@retrom/codegen/retrom/services/config/v1/config_service_pb";
import type { ServerConfig } from "@retrom/codegen/retrom/services/config/v1/models_pb";
import type { ConnectError } from "@connectrpc/connect";
import { useRetromClient } from "@/api-client/context";

export function useUpdateServerConfig() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    ServerConfig,
    ConnectError,
    MessageInitShape<typeof UpdateServerConfigRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.configClient.updateServerConfig(request),
    onSuccess: (config) => {
      queryClient.setQueryData(configQueryKeys.getServerConfig({}), config);
    },
  });
}
