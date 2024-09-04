import { UpdatePlatformsRequest } from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePlatforms() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["update-platforms"],
    mutationFn: (request: UpdatePlatformsRequest) =>
      retromClient.platformClient.updatePlatforms(request),
    onError: console.error,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["platform", "platforms"].some((k) => query.queryKey.includes(k)),
      });
    },
  });
}
