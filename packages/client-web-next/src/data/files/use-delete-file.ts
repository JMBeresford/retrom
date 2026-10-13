import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filesQueryKeys } from "./queries";
import type { ConnectError } from "@connectrpc/connect";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { DeleteFileRequestSchema } from "@retrom/codegen/retrom/services/files/v1/file_service_pb";
import type { File } from "@retrom/codegen/retrom/services/files/v1/file_pb";
import { useRetromClient } from "@/api-client/context";

export function useDeleteFile() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation<
    File,
    ConnectError,
    MessageInitShape<typeof DeleteFileRequestSchema>
  >({
    mutationFn: async (request) => retromClient.filesClient.deleteFile(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: filesQueryKeys.listAllFiles(),
      });
    },
  });
}
