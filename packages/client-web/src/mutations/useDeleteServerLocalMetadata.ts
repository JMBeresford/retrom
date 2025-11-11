import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";
import { DeleteLocalMetadataRequestSchema } from "@retrom/codegen/retrom/services/metadata-service_pb";

export function useDeleteServerLocalMetadata() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["delete-server-local-metadata"],
    mutationFn: (
      request: MessageInitShape<typeof DeleteLocalMetadataRequestSchema>,
    ) => retromClient.metadataClient.deleteLocalMetadata(request),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["server-local-metadata-status"].some((k) =>
            query.queryKey.includes(k),
          ),
      });
    },
  });
}
