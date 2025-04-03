import {
  GetClientsRequest,
  GetClientsResponse,
} from "@retrom/codegen/retrom/services/client-service";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type SelectFn<S> = (data: GetClientsResponse) => S;

export function useClientInfo<T = GetClientsResponse>(
  opts: {
    request?: Partial<GetClientsRequest>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: () => retromClient.clientsClient.getClients(request),
    queryKey: ["client-info", "clients", queryClient, request, retromClient],
    select: selectFn,
  });
}
