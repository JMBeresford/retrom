import { useQuery } from "@tanstack/react-query";
import { filesQueries } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { GetFileRequestSchema } from "@retrom/codegen/retrom/services/files/v1/file_service_pb";
import type { File } from "@retrom/codegen/retrom/services/files/v1/file_pb";
import type { FilesQueryKey } from "./queries";
import { useRetromClient } from "@/api-client/context";

export function useGetFile<TData = File>(
  params: {
    request?: MessageInitShape<typeof GetFileRequestSchema>;
    options?: QueryOptionsExt<
      File,
      ConnectError,
      TData,
      FilesQueryKey<"getFile">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(filesQueries.getFile(request, retromClient, options));
}
