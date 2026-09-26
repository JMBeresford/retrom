import { useQuery } from "@tanstack/react-query";
import { metadataQueries } from "./queries";
import type { MetadataQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { GetPlatformMetadataRequestSchema } from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";
import type { PlatformMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetPlatformMetadata<TData = PlatformMetadata>(
  params: {
    request?: MessageInitShape<typeof GetPlatformMetadataRequestSchema>;
    options?: QueryOptionsExt<
      PlatformMetadata,
      ConnectError,
      TData,
      MetadataQueryKey<"getPlatformMetadata">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    metadataQueries.getPlatformMetadata(request, retromClient, options),
  );
}
