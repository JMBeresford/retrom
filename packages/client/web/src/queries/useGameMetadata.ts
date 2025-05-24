import {
  type GetGameMetadataResponse,
  GetGameMetadataRequestSchema,
} from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetGameMetadataResponse) => S;

export function useGameMetadata<T = GetGameMetadataResponse>(
  opts: {
    request?: MessageInitShape<typeof GetGameMetadataRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: () => retromClient.metadataClient.getGameMetadata(request),
    queryKey: ["game-metadata", "metadata", queryClient, request],
    select: selectFn,
  });
}
