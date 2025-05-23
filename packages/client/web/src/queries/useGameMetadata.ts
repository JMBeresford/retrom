import type {
  GetGameMetadataRequest,
  GetGameMetadataResponse,
} from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type SelectFn<S> = (data: GetGameMetadataResponse) => S;

export function useGameMetadata<T = GetGameMetadataResponse>(
  opts: {
    request?: Partial<GetGameMetadataRequest>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await retromClient.metadataClient.getGameMetadata(request);
      return response as GetGameMetadataResponse;
    },
    queryKey: ["game-metadata", "metadata", queryClient, request],
    select: selectFn,
  });
}
