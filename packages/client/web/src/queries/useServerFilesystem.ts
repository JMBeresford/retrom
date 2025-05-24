import {
  GetFilesystemNodeRequestSchema,
  type GetFilesystemNodeResponse,
} from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetFilesystemNodeResponse) => S;

export function useServerFilesystem<T = GetFilesystemNodeResponse>(
  opts: {
    request?: MessageInitShape<typeof GetFilesystemNodeRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: async () => {
      const response =
        await retromClient.fileExplorerClient.getFilesystemNode(request);
      return response;
    },
    queryKey: ["file-explorer", request, retromClient],
    select: selectFn,
  });
}
