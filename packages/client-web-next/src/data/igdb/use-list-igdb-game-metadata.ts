import { useQuery } from "@tanstack/react-query";
import { igdbQueries } from "./queries";
import type { IgdbQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  ListIgdbGameMetadataRequestSchema,
  ListIgdbGameMetadataResponse,
} from "@retrom/codegen/retrom/services/metadata/v1/igdb_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useListIgdbGameMetadata<TData = ListIgdbGameMetadataResponse>(
  params: {
    request?: MessageInitShape<typeof ListIgdbGameMetadataRequestSchema>;
    options?: QueryOptionsExt<
      ListIgdbGameMetadataResponse,
      ConnectError,
      TData,
      IgdbQueryKey<"listIgdbGameMetadata">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    igdbQueries.listIgdbGameMetadata(request, retromClient, options),
  );
}
