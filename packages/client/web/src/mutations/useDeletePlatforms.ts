import { DeletePlatformsRequest } from "@retrom/codegen/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeletePlatforms() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deletePlatforms"],
    mutationFn: async (req: DeletePlatformsRequest) =>
      retromClient.platformClient.deletePlatforms(req),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          predicate: ({ queryKey }) =>
            ["platforms", "platform-metadata", "games", "game-metadata"].some(
              (key) => queryKey.includes(key),
            ),
        })
        .catch(console.error);
    },
  });
}
