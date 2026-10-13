import { useQuery } from "@tanstack/react-query";
import { filesQueries } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  ListFilesRequestSchema,
  ListFilesResponse,
} from "@retrom/codegen/retrom/services/files/v1/file_service_pb";
import type { FilesQueryKey } from "./queries";
import { useRetromClient } from "@/api-client/context";

export function useListFiles<TData = ListFilesResponse>(
  params: {
    request?: MessageInitShape<typeof ListFilesRequestSchema>;
    options?: QueryOptionsExt<
      ListFilesResponse,
      ConnectError,
      TData,
      FilesQueryKey<"listFiles">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(filesQueries.listFiles(request, retromClient, options));
}
