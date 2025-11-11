import {
  type GetGamesResponse,
  GetGamesRequestSchema,
} from "@retrom/codegen/retrom/services/game-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetGamesResponse) => S;

export function useGames<T = GetGamesResponse>(
  opts: {
    request?: MessageInitShape<typeof GetGamesRequestSchema>;
    selectFn?: SelectFn<T>;
  } = {},
) {
  const { request = {}, selectFn } = opts;
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["games", "game-metadata", "game-files", request, retromClient],
    queryFn: async () => await retromClient.gameClient.getGames(request),
    select: selectFn,
  });
}
