import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  GetGameMetadataRequestSchema,
  GetPlatformMetadataRequestSchema,
  ListGameMetadataRequestSchema,
  ListGameMetadataResponse,
  ListPlatformMetadataRequestSchema,
  ListPlatformMetadataResponse,
} from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";
import type {
  GameMetadata,
  PlatformMetadata,
} from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";

export type MetadataQueryKey<T extends keyof typeof metadataQueryKeys> =
  ReturnType<(typeof metadataQueryKeys)[T]>;

export const metadataQueryKeys = {
  all: () => ["metadata"] as const,
  getGameMetadata: (
    request: MessageInitShape<typeof GetGameMetadataRequestSchema>,
  ) => [...metadataQueryKeys.all(), "getGameMetadata", request] as const,
  listAllGameMetadata: () =>
    [...metadataQueryKeys.all(), "listGameMetadata"] as const,
  listGameMetadata: (
    request: MessageInitShape<typeof ListGameMetadataRequestSchema>,
  ) => [...metadataQueryKeys.listAllGameMetadata(), request] as const,
  getPlatformMetadata: (
    request: MessageInitShape<typeof GetPlatformMetadataRequestSchema>,
  ) => [...metadataQueryKeys.all(), "getPlatformMetadata", request] as const,
  listAllPlatformMetadata: () =>
    [...metadataQueryKeys.all(), "listPlatformMetadata"] as const,
  listPlatformMetadata: (
    request: MessageInitShape<typeof ListPlatformMetadataRequestSchema>,
  ) => [...metadataQueryKeys.listAllPlatformMetadata(), request] as const,
};

export const metadataQueries = {
  getGameMetadata: <TData>(
    request: MessageInitShape<typeof GetGameMetadataRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      GameMetadata,
      ConnectError,
      TData,
      MetadataQueryKey<"getGameMetadata">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: metadataQueryKeys.getGameMetadata(request),
      queryFn: async () => retromClient.metadataClient.getGameMetadata(request),
    }),
  listGameMetadata: <TData>(
    request: MessageInitShape<typeof ListGameMetadataRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListGameMetadataResponse,
      ConnectError,
      TData,
      MetadataQueryKey<"listGameMetadata">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: metadataQueryKeys.listGameMetadata(request),
      queryFn: async () =>
        retromClient.metadataClient.listGameMetadata(request),
    }),
  getPlatformMetadata: <TData>(
    request: MessageInitShape<typeof GetPlatformMetadataRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      PlatformMetadata,
      ConnectError,
      TData,
      MetadataQueryKey<"getPlatformMetadata">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: metadataQueryKeys.getPlatformMetadata(request),
      queryFn: async () =>
        retromClient.metadataClient.getPlatformMetadata(request),
    }),
  listPlatformMetadata: <TData>(
    request: MessageInitShape<typeof ListPlatformMetadataRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListPlatformMetadataResponse,
      ConnectError,
      TData,
      MetadataQueryKey<"listPlatformMetadata">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: metadataQueryKeys.listPlatformMetadata(request),
      queryFn: async () =>
        retromClient.metadataClient.listPlatformMetadata(request),
    }),
};
