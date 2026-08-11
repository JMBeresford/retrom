import { useQuery } from "@tanstack/react-query";
import { fileExplorerQueries } from "./queries";
import type { FileExplorerQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type {
  GetFilesystemNodeRequestSchema,
  GetFilesystemNodeResponse,
} from "@retrom/codegen/retrom/services/file_explorer/v1/file_explorer_service_pb";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import { useRetromClient } from "@/api-client/context";

export function useGetFilesystemNode<TData = GetFilesystemNodeResponse>(
  params: {
    request?: MessageInitShape<typeof GetFilesystemNodeRequestSchema>;
    options?: QueryOptionsExt<
      GetFilesystemNodeResponse,
      ConnectError,
      TData,
      FileExplorerQueryKey<"getFilesystemNode">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    fileExplorerQueries.getFilesystemNode(request, retromClient, options),
  );
}
