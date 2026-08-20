import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  GetFilesystemNodeRequestSchema,
  GetFilesystemNodeResponse,
} from "@retrom/codegen/retrom/services/file_explorer/v1/file_explorer_service_pb";

export type FileExplorerQueryKey<T extends keyof typeof fileExplorerQueryKeys> =
  ReturnType<(typeof fileExplorerQueryKeys)[T]>;

export const fileExplorerQueryKeys = {
  all: () => ["fileExplorer"] as const,
  getFilesystemNode: (
    request: MessageInitShape<typeof GetFilesystemNodeRequestSchema>,
  ) => [...fileExplorerQueryKeys.all(), "getFilesystemNode", request] as const,
};

export const fileExplorerQueries = {
  getFilesystemNode: <TData>(
    request: MessageInitShape<typeof GetFilesystemNodeRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      GetFilesystemNodeResponse,
      ConnectError,
      TData,
      FileExplorerQueryKey<"getFilesystemNode">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: fileExplorerQueryKeys.getFilesystemNode(request),
      queryFn: async () =>
        retromClient.fileExplorerClient.getFilesystemNode(request),
    }),
};
