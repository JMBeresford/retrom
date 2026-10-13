import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filesQueryKeys } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type {
  RegisterHostFileRequestSchema,
  RegisterHostFileResponse,
} from "@retrom/codegen/retrom/services/files/v1/file_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useRegisterHostFile() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    RegisterHostFileResponse,
    ConnectError,
    MessageInitShape<typeof RegisterHostFileRequestSchema>
  >({
    mutationFn: async (request) =>
      retromClient.filesClient.registerHostFile(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: filesQueryKeys.listAllFiles(),
      });
    },
  });
}
