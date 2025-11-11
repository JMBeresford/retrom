import { useRetromClient } from "@/providers/retrom-client";
import { MessageInitShape } from "@bufbuild/protobuf";
import {
  GetGameFilesRequestSchema,
  GetGameFilesResponse,
} from "@retrom/codegen/retrom/services/game-service_pb";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type SelectFn<S> = (data: GetGameFilesResponse) => S;

export function useGameFiles<T = GetGameFilesResponse>(
  opts: {
    request?: MessageInitShape<typeof GetGameFilesRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: () => retromClient.gameClient.getGameFiles(request),
    queryKey: ["game-files", queryClient, request],
    select: selectFn,
  });
}
