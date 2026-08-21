import { useQuery } from "@tanstack/react-query";
import { libraryQueries } from "./queries";
import type { LibraryQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  ListPlatformsRequestSchema,
  ListPlatformsResponse,
} from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useListPlatforms<TData = ListPlatformsResponse>(
  params: {
    request?: MessageInitShape<typeof ListPlatformsRequestSchema>;
    options?: QueryOptionsExt<
      ListPlatformsResponse,
      ConnectError,
      TData,
      LibraryQueryKey<"listPlatforms">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(libraryQueries.listPlatforms(request, retromClient, options));
}
