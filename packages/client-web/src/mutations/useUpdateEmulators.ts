import { useToast } from "@retrom/ui/hooks/use-toast";
import { UpdateEmulatorsRequestSchema } from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";
import { ConnectError } from "@connectrpc/connect";

export function useUpdateEmulators(options?: { showErrorToast?: boolean }) {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof UpdateEmulatorsRequestSchema>,
    ) => retromClient.emulatorClient.updateEmulators(request),
    mutationKey: ["emulators"],
    onError: (error) => {
      console.error(error);

      if (options?.showErrorToast === false) {
        return;
      }

      toast({
        title: "Failed to update emulators",
        description:
          error instanceof ConnectError
            ? error.message
            : "Check the console for more information.",
        variant: "destructive",
      });
    },
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
