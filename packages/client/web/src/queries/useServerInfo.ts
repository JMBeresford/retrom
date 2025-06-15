import {
  GetServerInfoRequestSchema,
  type GetServerInfoResponse,
} from "@retrom/codegen/retrom/services/server-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetServerInfoResponse) => S;

export function useServerInfo<T = GetServerInfoResponse>(
  opts: {
    request?: MessageInitShape<typeof GetServerInfoRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: () => retromClient.serverClient.getServerInfo(request),
    queryKey: ["server-info", queryClient, request, retromClient],
    select: selectFn,
  });
}
