import { useQuery } from "@tanstack/react-query";
import { metadataQueries } from "./queries";
import type { MetadataQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { GetGameMetadataRequestSchema } from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetGameMetadata<TData = GameMetadata>(
  params: {
    request?: MessageInitShape<typeof GetGameMetadataRequestSchema>;
    options?: QueryOptionsExt<
      GameMetadata,
      ConnectError,
      TData,
      MetadataQueryKey<"getGameMetadata">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    metadataQueries.getGameMetadata(request, retromClient, options),
  );
}
