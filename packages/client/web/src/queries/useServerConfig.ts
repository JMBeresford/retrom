import {
  GetServerConfigRequest,
  GetServerConfigResponse,
} from "@/generated/retrom/services";
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
    queryFn: () =>
      retromClient.serverClient.getServerConfig(opts.request ?? {}),
  });
}
