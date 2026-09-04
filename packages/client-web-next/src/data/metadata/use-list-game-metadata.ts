import { useQuery } from "@tanstack/react-query";
import { metadataQueries } from "./queries";
import type { MetadataQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  ListGameMetadataRequestSchema,
  ListGameMetadataResponse,
} from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useListGameMetadata<TData = ListGameMetadataResponse>(
  params: {
    request?: MessageInitShape<typeof ListGameMetadataRequestSchema>;
    options?: QueryOptionsExt<
      ListGameMetadataResponse,
      ConnectError,
      TData,
      MetadataQueryKey<"listGameMetadata">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    metadataQueries.listGameMetadata(request, retromClient, options),
  );
}
