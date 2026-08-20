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

export type LibraryQueryKey<T extends keyof typeof libraryQueryKeys> =
  ReturnType<(typeof libraryQueryKeys)[T]>;

export const libraryQueryKeys = {
  all: () => ["libraries"] as const,
  getLibrary: (request: MessageInitShape<typeof GetLibraryRequestSchema>) =>
    [...libraryQueryKeys.all(), "getLibrary", request] as const,
  listAllLibraries: () =>
    [...libraryQueryKeys.all(), "listAllLibraries"] as const,
  listLibraries: (
    request: MessageInitShape<typeof ListLibrariesRequestSchema>,
  ) => [...libraryQueryKeys.listAllLibraries(), request] as const,
};

export const libraryQueries = {
  getLibrary: <TData>(
    request: MessageInitShape<typeof GetLibraryRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      Library,
      ConnectError,
      TData,
      LibraryQueryKey<"getLibrary">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.getLibrary(request),
      queryFn: () => retromClient.libraryClient.getLibrary(request),
    }),
  listLibraries: <TData>(
    request: MessageInitShape<typeof ListLibrariesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListLibrariesResponse,
      ConnectError,
      TData,
      LibraryQueryKey<"listLibraries">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.listLibraries(request),
      queryFn: () => retromClient.libraryClient.listLibraries(request),
    }),
};
