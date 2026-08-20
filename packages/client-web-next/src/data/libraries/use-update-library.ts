import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryQueryKeys } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { UpdateLibraryRequestSchema } from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import type { ConnectError } from "@connectrpc/connect";
import { useRetromClient } from "@/api-client/context";

export function useUpdateLibrary() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    Library,
    ConnectError,
    MessageInitShape<typeof UpdateLibraryRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.libraryClient.updateLibrary(request),
    onSuccess: async (_, { library }) => {
      queryClient.setQueryData(
        libraryQueryKeys.getLibrary({ id: library?.id }),
        library,
      );

      await queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.listAllLibraries(),
      });
    },
  });
}
