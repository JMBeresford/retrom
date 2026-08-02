import { useQuery } from "@tanstack/react-query";
import { libraryQueries } from "./queries";
import type { LibrariesQueryKey } from "./queries";
import type {
  ListLibrariesRequestSchema,
  ListLibrariesResponse,
} from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import { useRetromClient } from "@/api-client/context";

export function useListLibraries<TData>(
  params: {
    request?: MessageInitShape<typeof ListLibrariesRequestSchema>;
    options?: QueryOptionsExt<
      ListLibrariesResponse,
      ConnectError,
      TData,
      LibrariesQueryKey<"list">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(libraryQueries.list(request, retromClient, options));
}
