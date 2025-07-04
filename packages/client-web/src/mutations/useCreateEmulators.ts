import { useToast } from "@/components/ui/use-toast";
import { CreateEmulatorsRequestSchema } from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useCreateEmulators() {
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
      toast({
        title: "Failed to create emulators",
        description: "Check the console for more information.",
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
