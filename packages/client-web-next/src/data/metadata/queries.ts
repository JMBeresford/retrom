import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  ListPlatformMetadataRequestSchema,
  ListPlatformMetadataResponse,
} from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";

export type MetadataQueryKey<T extends keyof typeof metadataQueryKeys> =
  ReturnType<(typeof metadataQueryKeys)[T]>;

export const metadataQueryKeys = {
  all: () => ["metadata"] as const,
  listAllPlatformMetadata: () =>
    [...metadataQueryKeys.all(), "listPlatformMetadata"] as const,
  listPlatformMetadata: (
    request: MessageInitShape<typeof ListPlatformMetadataRequestSchema>,
  ) => [...metadataQueryKeys.listAllPlatformMetadata(), request] as const,
};

export const metadataQueries = {
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
