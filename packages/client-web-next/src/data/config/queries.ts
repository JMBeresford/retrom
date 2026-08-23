import { queryOptions } from "@tanstack/react-query";
import type {
  GetServerConfigRequestSchema,
  GetServerInfoRequestSchema,
} from "@retrom/codegen/retrom/services/config/v1/config_service_pb";
import type { ConnectError } from "@connectrpc/connect";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  ServerConfig,
  ServerInfo,
} from "@retrom/codegen/retrom/services/config/v1/models_pb";

export type ConfigQueryKey<T extends keyof typeof configQueryKeys> = ReturnType<
  (typeof configQueryKeys)[T]
>;

export const configQueryKeys = {
  all: () => ["config"] as const,
  getServerInfo: (
    request: MessageInitShape<typeof GetServerInfoRequestSchema>,
  ) => [...configQueryKeys.all(), "getServerInfo", request] as const,
  getServerConfig: (
    request: MessageInitShape<typeof GetServerConfigRequestSchema>,
  ) => [...configQueryKeys.all(), "getServerConfig", request] as const,
};

export const configQueries = {
  getServerConfig: <TData>(
    request: MessageInitShape<typeof GetServerConfigRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ServerConfig,
      ConnectError,
      TData,
      ConfigQueryKey<"getServerConfig">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: configQueryKeys.getServerConfig(request),
      queryFn: () => retromClient.configClient.getServerConfig(request),
    }),
  getServerInfo: <TData>(
    request: MessageInitShape<typeof GetServerInfoRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ServerInfo,
      ConnectError,
      TData,
      ConfigQueryKey<"getServerInfo">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: configQueryKeys.getServerInfo(request),
      queryFn: () => retromClient.configClient.getServerInfo(request),
    }),
};
