import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryQueryKeys } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { DeleteLibraryRequestSchema } from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useDeleteLibrary() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: MessageInitShape<typeof DeleteLibraryRequestSchema>,
    ) => retromClient.libraryClient.deleteLibrary(request),
    onSuccess: async (_, request) => {
      await queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.getLibrary({ id: request.id }),
      });

      await queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.listAllLibraries(),
      });
    },
  });
}
