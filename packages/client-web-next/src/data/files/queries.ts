import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { RetromClient } from "@/api-client/client";
import type { QueryOptionsExt } from "../common";
import type {
  ExploreHostPathsRequestSchema,
  ExploreHostPathsResponse,
  GetFileRequestSchema,
  ListFilesRequestSchema,
  ListFilesResponse,
  RegisterHostFileRequestSchema,
  RegisterHostFileResponse,
} from "@retrom/codegen/retrom/services/files/v1/file_service_pb";
import type { File } from "@retrom/codegen/retrom/services/files/v1/file_pb";

export type FilesQueryKey<T extends keyof typeof filesQueryKeys> = ReturnType<
  (typeof filesQueryKeys)[T]
>;

export const filesQueryKeys = {
  all: () => ["files"] as const,
  getFile: (request: MessageInitShape<typeof GetFileRequestSchema>) =>
    [...filesQueryKeys.all(), "getFile", request] as const,
  listAllFiles: () => [...filesQueryKeys.all(), "listAllFiles"] as const,
  listFiles: (request: MessageInitShape<typeof ListFilesRequestSchema>) =>
    [...filesQueryKeys.listAllFiles(), request] as const,
  exploreHostPaths: (
    request: MessageInitShape<typeof ExploreHostPathsRequestSchema>,
  ) => [...filesQueryKeys.all(), "exploreHostPaths", request] as const,
  registerHostFile: (
    request: MessageInitShape<typeof RegisterHostFileRequestSchema>,
  ) => [...filesQueryKeys.all(), "registerHostFile", request] as const,
};

export const filesQueries = {
  getFile: <TData>(
    request: MessageInitShape<typeof GetFileRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      File,
      ConnectError,
      TData,
      FilesQueryKey<"getFile">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: filesQueryKeys.getFile(request),
      queryFn: async () => retromClient.filesClient.getFile(request),
    }),
  listFiles: <TData>(
    request: MessageInitShape<typeof ListFilesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListFilesResponse,
      ConnectError,
      TData,
      FilesQueryKey<"listFiles">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: filesQueryKeys.listFiles(request),
      queryFn: async () => retromClient.filesClient.listFiles(request),
    }),
  exploreHostPaths: <TData>(
    request: MessageInitShape<typeof ExploreHostPathsRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ExploreHostPathsResponse,
      ConnectError,
      TData,
      FilesQueryKey<"exploreHostPaths">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: filesQueryKeys.exploreHostPaths(request),
      queryFn: async () =>
        retromClient.filesClient.exploreHostPaths(request),
    }),
  registerHostFile: <TData>(
    request: MessageInitShape<typeof RegisterHostFileRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      RegisterHostFileResponse,
      ConnectError,
      TData,
      FilesQueryKey<"registerHostFile">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: filesQueryKeys.registerHostFile(request),
      queryFn: async () =>
        retromClient.filesClient.registerHostFile(request),
    }),
};
