import { GameSchema } from "@retrom/codegen/retrom/models/games_pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playGame } from "@retrom/plugin-launcher";
import { PlayGamePayloadSchema } from "@retrom/codegen/retrom/client/client-utils_pb";
import { MessageInitShape } from "@bufbuild/protobuf";

export function usePlayGame(game?: MessageInitShape<typeof GameSchema>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["play", game?.id],
    mutationFn: (payload: MessageInitShape<typeof PlayGamePayloadSchema>) =>
      playGame(payload),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["play-status", game?.id],
      });
    },
  });
}
