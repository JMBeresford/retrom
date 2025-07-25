import { useToast } from "@retrom/ui/hooks/use-toast";
import { CreateEmulatorProfilesRequestSchema } from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useCreateEmulatorProfiles() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (
      request: MessageInitShape<typeof CreateEmulatorProfilesRequestSchema>,
    ) => retromClient.emulatorClient.createEmulatorProfiles(request),
    mutationKey: ["create-emulator-profiles", queryClient],
    onError: (error) => {
      console.error(error);
      toast({
        title: "Failed to create emulator profiles",
        description: "Check the console for more information.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Emulator profile(s) created",
        description: "Emulator profile(s) have been created successfully.",
      });
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["emulator-profiles", "emulator-profile"].some((v) =>
            query.queryKey.includes(v),
          ),
      });
    },
  });
}
