import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  ListIgdbGameMetadataRequestSchema,
  ListIgdbGameMetadataResponse,
  ListIgdbPlatformMetadataRequestSchema,
  ListIgdbPlatformMetadataResponse,
} from "@retrom/codegen/retrom/services/metadata/v1/igdb_service_pb";

export type IgdbQueryKey<T extends keyof typeof igdbQueryKeys> = ReturnType<
  (typeof igdbQueryKeys)[T]
>;

export const igdbQueryKeys = {
  all: () => ["igdb"] as const,
  listAllIgdbGameMetadata: () =>
    [...igdbQueryKeys.all(), "listIgdbGameMetadata"] as const,
  listIgdbGameMetadata: (
    request: MessageInitShape<typeof ListIgdbGameMetadataRequestSchema>,
  ) => [...igdbQueryKeys.listAllIgdbGameMetadata(), request] as const,
  listAllIgdbPlatformMetadata: () =>
    [...igdbQueryKeys.all(), "listIgdbPlatformMetadata"] as const,
  listIgdbPlatformMetadata: (
    request: MessageInitShape<typeof ListIgdbPlatformMetadataRequestSchema>,
  ) => [...igdbQueryKeys.listAllIgdbPlatformMetadata(), request] as const,
};

export const igdbQueries = {
  listIgdbGameMetadata: <TData>(
    request: MessageInitShape<typeof ListIgdbGameMetadataRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListIgdbGameMetadataResponse,
      ConnectError,
      TData,
      IgdbQueryKey<"listIgdbGameMetadata">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: igdbQueryKeys.listIgdbGameMetadata(request),
      queryFn: () => retromClient.igdbClient.listIgdbGameMetadata(request),
    }),
  listIgdbPlatformMetadata: <TData>(
    request: MessageInitShape<typeof ListIgdbPlatformMetadataRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListIgdbPlatformMetadataResponse,
      ConnectError,
      TData,
      IgdbQueryKey<"listIgdbPlatformMetadata">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: igdbQueryKeys.listIgdbPlatformMetadata(request),
      queryFn: () => retromClient.igdbClient.listIgdbPlatformMetadata(request),
    }),
};
