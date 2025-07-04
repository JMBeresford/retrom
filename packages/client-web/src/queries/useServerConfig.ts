import {
  GetServerConfigRequestSchema,
  type GetServerConfigResponse,
} from "@retrom/codegen/retrom/services/server-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetServerConfigResponse) => S;

export function useServerConfig<T = GetServerConfigResponse>(
  opts: {
    request?: MessageInitShape<typeof GetServerConfigRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["server-config", opts.request],
    select: opts.selectFn,
    enabled: opts.enabled,
    queryFn: async () => {
      const response = await retromClient.serverClient.getServerConfig(
        opts.request ?? {},
      );
      return response;
    },
  });
}
