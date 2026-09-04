import { useMutation, useQueryClient } from "@tanstack/react-query";
import { metadataQueryKeys } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { ConnectError } from "@connectrpc/connect";
import type { PlatformMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { UpdatePlatformMetadataRequestSchema } from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useUpdatePlatformMetadata() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    PlatformMetadata,
    ConnectError,
    MessageInitShape<typeof UpdatePlatformMetadataRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.metadataClient.updatePlatformMetadata(request),
    onSuccess: async (_, { metadata }) => {
      queryClient.setQueryData(
        metadataQueryKeys.getPlatformMetadata({ id: metadata?.id }),
        metadata,
      );

      await queryClient.invalidateQueries({
        queryKey: metadataQueryKeys.listAllPlatformMetadata(),
      });
    },
  });
}
