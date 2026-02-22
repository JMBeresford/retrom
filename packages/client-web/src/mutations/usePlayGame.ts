import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playGame } from "@retrom/plugin-launcher";
import { PlayGamePayload } from "@retrom/codegen/retrom/client/client-utils_pb";
import { RawMessage } from "@/utils/protos";

export function usePlayGame(game?: RawMessage<Game>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["play", game?.id],
    mutationFn: (payload: RawMessage<PlayGamePayload>) => playGame(payload),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["play-status", game?.id],
      });
    },
  });
}
