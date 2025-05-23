import type { useToast } from "@/components/ui/use-toast";
import { UpdateDefaultEmulatorProfilesRequest } from "@retrom/codegen/retrom/services_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateDefaultEmulatorProfiles() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: UpdateDefaultEmulatorProfilesRequest) =>
      retromClient.emulatorClient.updateDefaultEmulatorProfiles(request),
    mutationKey: ["update-default-emulator-profiles", queryClient],
    onError: (error) => {
      console.error(error);
      toast({
        title: "Failed to update emulator profiles",
        description: "Check the console for more information.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Default Emulator profile(s) updated",
        description:
          "Default emulator profile(s) have been updated successfully.",
      });
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["default-emulator-profiles", "default-emulator-profile"].some((v) =>
            query.queryKey.includes(v),
          ),
      });
    },
  });
}
