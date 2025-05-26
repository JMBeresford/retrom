import { DeleteEmulatorProfilesRequestSchema } from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useDeleteEmulatorProfiles(
  opts: { key?: string | number } = {},
) {
  const { key } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof DeleteEmulatorProfilesRequestSchema>,
    ) => retromClient.emulatorClient.deleteEmulatorProfiles(request),
    mutationKey: ["delete-emulator-profiles", key],
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["emulator-profiles", "emulator-profile"].some((v) =>
            query.queryKey.includes(v),
          ),
      });
    },
  });
}
