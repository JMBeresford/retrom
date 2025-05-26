import { MessageInitShape } from "@bufbuild/protobuf";
import { StopGamePayloadSchema } from "@retrom/codegen/retrom/client/client-utils_pb";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { stopGame } from "@retrom/plugin-launcher";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useStopGame(game?: Game) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["stop", game?.id],
    mutationFn: async (
      payload: MessageInitShape<typeof StopGamePayloadSchema>,
    ) => stopGame(payload),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["play-status", game?.id],
      });
    },
  });
}
