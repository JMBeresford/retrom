import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryQueryKeys } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { CreateLibraryRequestSchema } from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import type { ConnectError } from "@connectrpc/connect";
import { useRetromClient } from "@/api-client/context";

export function useCreateLibrary() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    Library,
    ConnectError,
    MessageInitShape<typeof CreateLibraryRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.libraryClient.createLibrary(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.listAllLibraries(),
      });
    },
  });
}
