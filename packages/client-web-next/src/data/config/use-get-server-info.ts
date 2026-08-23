import { useQuery } from "@tanstack/react-query";
import { configQueries } from "./queries";
import type { ConfigQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { ServerInfo } from "@retrom/codegen/retrom/services/config/v1/models_pb";
import type { GetServerInfoRequestSchema } from "@retrom/codegen/retrom/services/config/v1/config_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetServerInfo<TData = ServerInfo>(
  params: {
    request?: MessageInitShape<typeof GetServerInfoRequestSchema>;
    options?: QueryOptionsExt<
      ServerInfo,
      ConnectError,
      TData,
      ConfigQueryKey<"getServerInfo">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(configQueries.getServerInfo(request, retromClient, options));
}
