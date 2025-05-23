import type { UpdatePlatformsRequest } from "@retrom/codegen/retrom/services_pb";
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
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["platform", "platforms"].some((k) => query.queryKey.includes(k)),
      });
    },
  });
}
