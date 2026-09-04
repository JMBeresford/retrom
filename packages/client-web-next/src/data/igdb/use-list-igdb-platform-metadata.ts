import { useQuery } from "@tanstack/react-query";
import { igdbQueries } from "./queries";
import type { IgdbQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  ListIgdbPlatformMetadataRequestSchema,
  ListIgdbPlatformMetadataResponse,
} from "@retrom/codegen/retrom/services/metadata/v1/igdb_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useListIgdbPlatformMetadata<
  TData = ListIgdbPlatformMetadataResponse,
>(
  params: {
    request?: MessageInitShape<typeof ListIgdbPlatformMetadataRequestSchema>;
    options?: QueryOptionsExt<
      ListIgdbPlatformMetadataResponse,
      ConnectError,
      TData,
      IgdbQueryKey<"listIgdbPlatformMetadata">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    igdbQueries.listIgdbPlatformMetadata(request, retromClient, options),
  );
}
