import { DeletePlatformsRequestSchema } from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useDeletePlatforms() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deletePlatforms"],
    mutationFn: async (
      req: MessageInitShape<typeof DeletePlatformsRequestSchema>,
    ) => {
      const response = await retromClient.platformClient.deletePlatforms(req);
      return response;
    },
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
