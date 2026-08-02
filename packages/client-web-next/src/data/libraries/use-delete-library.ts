import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryKeys } from "./queries";
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
        queryKey: libraryKeys.get({ id: request.id }, retromClient),
      });

      await queryClient.invalidateQueries({
        queryKey: libraryKeys.allList(),
      });
    },
  });
}
