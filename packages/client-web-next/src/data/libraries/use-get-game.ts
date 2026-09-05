import { useQuery } from "@tanstack/react-query";
import { libraryQueries } from "./queries";
import type { LibraryQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { GetGameRequestSchema } from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import type { Game } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetGame<TData = Game>(
  params: {
    request?: MessageInitShape<typeof GetGameRequestSchema>;
    options?: QueryOptionsExt<
      Game,
      ConnectError,
      TData,
      LibraryQueryKey<"getGame">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(libraryQueries.getGame(request, retromClient, options));
}
