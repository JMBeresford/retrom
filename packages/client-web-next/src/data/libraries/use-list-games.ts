import { useQuery } from "@tanstack/react-query";
import { libraryQueries } from "./queries";
import type { LibraryQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  ListGamesRequestSchema,
  ListGamesResponse,
} from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useListGames<TData = ListGamesResponse>(
  params: {
    request?: MessageInitShape<typeof ListGamesRequestSchema>;
    options?: QueryOptionsExt<
      ListGamesResponse,
      ConnectError,
      TData,
      LibraryQueryKey<"listGames">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(libraryQueries.listGames(request, retromClient, options));
}
