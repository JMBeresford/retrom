import { useToast } from "@/components/ui/use-toast";
import { UpdateEmulatorsRequestSchema } from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useUpdateEmulators() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof UpdateEmulatorsRequestSchema>,
    ) => retromClient.emulatorClient.updateEmulators(request),
    mutationKey: ["emulators"],
    onSuccess: () => {
      toast({
        title: "Emulator(s) updated",
        description: "Emulator(s) have been updated successfully.",
      });

      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["emulators"].some((v) => query.queryKey.includes(v)),
      });
    },
  });
}
