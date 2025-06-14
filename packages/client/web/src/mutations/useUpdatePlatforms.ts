import { UpdatePlatformsRequestSchema } from "@retrom/codegen/retrom/services/platform-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useUpdatePlatforms() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["update-platforms"],
    mutationFn: (
      request: MessageInitShape<typeof UpdatePlatformsRequestSchema>,
    ) => retromClient.platformClient.updatePlatforms(request),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["platform", "platforms"].some((k) => query.queryKey.includes(k)),
      });
    },
  });
}
