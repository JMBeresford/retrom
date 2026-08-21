import { useQuery } from "@tanstack/react-query";
import { metadataQueries } from "./queries";
import type { MetadataQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  ListPlatformMetadataRequestSchema,
  ListPlatformMetadataResponse,
} from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useListPlatformMetadata<TData = ListPlatformMetadataResponse>(
  params: {
    request?: MessageInitShape<typeof ListPlatformMetadataRequestSchema>;
    options?: QueryOptionsExt<
      ListPlatformMetadataResponse,
      ConnectError,
      TData,
      MetadataQueryKey<"listPlatformMetadata">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    metadataQueries.listPlatformMetadata(request, retromClient, options),
  );
}
