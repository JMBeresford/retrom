import { useQuery } from "@tanstack/react-query";
import { libraryQueries } from "./queries";
import type { LibraryQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  ListGameFilesRequestSchema,
  ListGameFilesResponse,
} from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useListGameFiles<TData = ListGameFilesResponse>(
  params: {
    request?: MessageInitShape<typeof ListGameFilesRequestSchema>;
    options?: QueryOptionsExt<
      ListGameFilesResponse,
      ConnectError,
      TData,
      LibraryQueryKey<"listGameFiles">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(libraryQueries.listGameFiles(request, retromClient, options));
}
