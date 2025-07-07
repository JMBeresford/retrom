import { DeleteEmulatorsRequestSchema } from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useToast } from "@retrom/ui/hooks/use-toast";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useDeleteEmulators(opts: { key?: string | number } = {}) {
  const { key } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof DeleteEmulatorsRequestSchema>,
    ) => retromClient.emulatorClient.deleteEmulators(request),
    mutationKey: ["delete-emulator", key],
    onSuccess: () => {
      toast({
        title: "Emulator(s) deleted",
        description: "Emulator(s) have been deleted successfully.",
      });

      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["emulators", "emulator"].some((v) => query.queryKey.includes(v)),
      });
    },
  });
}
