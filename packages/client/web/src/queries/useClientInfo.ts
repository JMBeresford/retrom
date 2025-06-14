import {
  GetClientsRequestSchema,
  GetClientsResponse,
} from "@retrom/codegen/retrom/services/client-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetClientsResponse) => S;

export function useClientInfo<T = GetClientsResponse>(
  opts: {
    request?: MessageInitShape<typeof GetClientsRequestSchema>;
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
