import { useQuery } from "@tanstack/react-query";
import { configQueries } from "./queries";
import type { ConfigQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { ServerConfig } from "@retrom/codegen/retrom/services/config/v1/models_pb";
import type { GetServerConfigRequestSchema } from "@retrom/codegen/retrom/services/config/v1/config_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetServerConfig<TData>(
  params: {
    request?: MessageInitShape<typeof GetServerConfigRequestSchema>;
    options?: QueryOptionsExt<
      ServerConfig,
      ConnectError,
      TData,
      ConfigQueryKey<"getServerConfig">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(configQueries.getServerConfig(request, retromClient, options));
}
