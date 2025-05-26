import { UpdateGameFilesRequestSchema } from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useUpdateGameFiles() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["update-game-files"],
    mutationFn: (
      request: MessageInitShape<typeof UpdateGameFilesRequestSchema>,
    ) => retromClient.gameClient.updateGameFiles(request),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["game-file", "game-files"].some((k) => query.queryKey.includes(k)),
      });
    },
  });
}
