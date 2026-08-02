import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type {
  GetLibraryRequestSchema,
  ListLibrariesRequestSchema,
  ListLibrariesResponse,
} from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import type { QueryOptionsExt } from "../common";

export type LibrariesQueryKey<T extends keyof typeof libraryKeys> = ReturnType<
  (typeof libraryKeys)[T]
>;

export const libraryKeys = {
  all: () => ["libraries"] as const,
  get: (
    request: MessageInitShape<typeof GetLibraryRequestSchema>,
    client: RetromClient,
  ) => [...libraryKeys.all(), "get", request, client] as const,
  allList: () => [...libraryKeys.all(), "list"] as const,
  list: (
    request: MessageInitShape<typeof ListLibrariesRequestSchema>,
    client: RetromClient,
  ) => [...libraryKeys.allList(), request, client] as const,
};

export const libraryQueries = {
  get: <TData>(
    request: MessageInitShape<typeof GetLibraryRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      Library,
      ConnectError,
      TData,
      LibrariesQueryKey<"get">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryKeys.get(request, retromClient),
      queryFn: () => retromClient.libraryClient.getLibrary(request),
    }),
  list: <TData>(
    request: MessageInitShape<typeof ListLibrariesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListLibrariesResponse,
      ConnectError,
      TData,
      LibrariesQueryKey<"list">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryKeys.list(request, retromClient),
      queryFn: () => retromClient.libraryClient.listLibraries(request),
    }),
};
