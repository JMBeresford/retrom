import { Platform } from "@/generated/retrom/models/platforms";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeletePlatforms(platforms: Platform[]) {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deletePlatforms", platforms],
    mutationFn: async () =>
      retromClient.platformClient.deletePlatforms({
        ids: platforms.map((platform) => platform.id),
      }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: [
          "platforms",
          "platform-metadata",
          "library",
          ...platforms.map((g) => g.id),
        ],
      });
    },
  });
}
