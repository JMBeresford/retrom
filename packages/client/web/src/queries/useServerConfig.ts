import type {
  GetServerConfigRequest,
  GetServerConfigResponse,
} from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";

type SelectFn<S> = (data: GetServerConfigResponse) => S;

export function useServerConfig<T = GetServerConfigResponse>(
  opts: {
    request?: Partial<GetServerConfigRequest>;
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
      return response as GetServerConfigResponse;
    },
  });
}
