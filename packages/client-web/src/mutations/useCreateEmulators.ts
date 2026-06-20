import { useToast } from "@retrom/ui/hooks/use-toast";
import { CreateEmulatorsRequestSchema } from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";
import { ConnectError } from "@connectrpc/connect";

export function useCreateEmulators(options?: { showErrorToast?: boolean }) {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof CreateEmulatorsRequestSchema>,
    ) => retromClient.emulatorClient.createEmulators(request),
    mutationKey: ["create-emulators", queryClient],
    onError: (error) => {
      console.error(error);

      if (options?.showErrorToast === false) {
        return;
      }

      toast({
        title: "Failed to create emulators",
        description:
          error instanceof ConnectError
            ? error.message
            : "Check the console for more information.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Emulator(s) created",
        description: "Emulator(s) have been created successfully.",
      });
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["emulators", "emulator", "emulator-profiles"].some((v) =>
            query.queryKey.includes(v),
          ),
      });
    },
  });
}
