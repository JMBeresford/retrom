import { useQuery } from "@tanstack/react-query";
import { filesQueries } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  ExploreHostPathsRequestSchema,
  ExploreHostPathsResponse,
} from "@retrom/codegen/retrom/services/files/v1/file_service_pb";
import type { FilesQueryKey } from "./queries";
import { useRetromClient } from "@/api-client/context";

export function useExploreHostPaths<TData = ExploreHostPathsResponse>(
  params: {
    request?: MessageInitShape<typeof ExploreHostPathsRequestSchema>;
    options?: QueryOptionsExt<
      ExploreHostPathsResponse,
      ConnectError,
      TData,
      FilesQueryKey<"exploreHostPaths">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    filesQueries.exploreHostPaths(request, retromClient, options),
  );
}
