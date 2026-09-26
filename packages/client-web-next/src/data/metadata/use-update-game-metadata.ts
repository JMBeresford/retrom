import { useMutation, useQueryClient } from "@tanstack/react-query";
import { metadataQueryKeys } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { ConnectError } from "@connectrpc/connect";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { UpdateGameMetadataRequestSchema } from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useUpdateGameMetadata() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    GameMetadata,
    ConnectError,
    MessageInitShape<typeof UpdateGameMetadataRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.metadataClient.updateGameMetadata(request),
    onSuccess: async (_, { metadata }) => {
      queryClient.setQueryData(
        metadataQueryKeys.getGameMetadata({ name: metadata?.name }),
        metadata,
      );

      await queryClient.invalidateQueries({
        queryKey: metadataQueryKeys.listAllGameMetadata(),
      });
    },
  });
}
