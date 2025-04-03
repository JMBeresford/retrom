import {
  GetFilesystemNodeRequest,
  GetFilesystemNodeResponse,
} from "@retrom/codegen/retrom/services/file-explorer-service";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";

type SelectFn<S> = (data: GetFilesystemNodeResponse) => S;

export function useServerFilesystem<T = GetFilesystemNodeResponse>(
  opts: {
    request?: Partial<GetFilesystemNodeRequest>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: () => retromClient.fileExplorerClient.getFilesystemNode(request),
    queryKey: ["file-explorer", request, retromClient],
    select: selectFn,
  });
}
