import { Progress } from "@retrom/ui/components/progress";
import { toast } from "@retrom/ui/hooks/use-toast";
import { useRetromClient } from "@/providers/retrom-client";
import { RawMessage } from "@/utils/protos";
import {
  DeleteSaveStatesRequest,
  RestoreSaveStatesFromBackupRequest,
  UpdateSaveStatesRequest,
} from "@retrom/codegen/retrom/services/saves-service_pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateSaveStates() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RawMessage<UpdateSaveStatesRequest>) => {
      const { update } = toast({
        id: "upload-save-state",
        title: "Uploading Save State",
        description: <Progress />,
        duration: Infinity,
      });

      try {
        const res = await retromClient.savesClient.updateSaveStates(request);

        await queryClient
          .invalidateQueries({
            predicate: ({ queryKey }) =>
              ["getSaveStates", "statSaveStates"].some((k) =>
                queryKey.includes(k),
              ),
          })
          .catch(console.error);

        update({
          title: "Save State Uploaded",
          description: "Your save state has been uploaded successfully",
        });

        return res;
      } catch (error) {
        update({
          title: "Failed to upload save state",
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          variant: "destructive",
        });
      }
    },

    mutationKey: ["updateSaveStates"],
  });
}

export function useRestoreSaveStatesFromBackup() {
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: async (
      request: RawMessage<RestoreSaveStatesFromBackupRequest>,
    ) => retromClient.savesClient.restoreSaveStatesFromBackup(request),

    mutationKey: ["restoreSaveStatesFromBackup"],
  });
}

export function useDeleteSaveStates() {
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: async (request: RawMessage<DeleteSaveStatesRequest>) =>
      retromClient.savesClient.deleteSaveStates(request),
    mutationKey: ["deleteSaveStates"],
  });
}
