import { DeleteGameFilesRequestSchema } from "@retrom/codegen/retrom/services/game-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useDeleteGameFiles() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["delete-game-files"],
    mutationFn: (
      request: MessageInitShape<typeof DeleteGameFilesRequestSchema>,
    ) => retromClient.gameClient.deleteGameFiles(request),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["game-file", "game-files"].some((k) => query.queryKey.includes(k)),
      });
    },
  });
}
