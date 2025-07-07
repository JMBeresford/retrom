import { Progress } from "@retrom/ui/components/progress";
import { toast } from "@retrom/ui/hooks/use-toast";
import { useRetromClient } from "@/providers/retrom-client";
import { create, MessageInitShape } from "@bufbuild/protobuf";
import {
  RestoreSaveFilesFromBackupRequestSchema,
  UpdateSaveFilesRequestSchema,
} from "@retrom/codegen/retrom/services/saves-service_pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateSaveFiles() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: MessageInitShape<typeof UpdateSaveFilesRequestSchema>,
    ) => {
      const { update } = toast({
        id: "upload-save-file",
        title: "Uploading Save File",
        description: <Progress />,
        duration: Infinity,
      });

      try {
        const res = await retromClient.savesClient.updateSaveFiles(
          create(UpdateSaveFilesRequestSchema, request),
        );

        await queryClient
          .invalidateQueries({
            predicate: ({ queryKey }) =>
              ["getSaveFiles", "statSaveFiles"].some((k) =>
                queryKey.includes(k),
              ),
          })
          .catch(console.error);

        update({
          title: "Save Uploaded",
          description: "Your save has been uploaded successfully",
        });

        return res;
      } catch (error) {
        update({
          title: "Failed to upload save",
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          variant: "destructive",
        });
      }
    },

    mutationKey: ["updateSaveFiles"],
  });
}

export function useRestoreSaveFromBackup() {
  const retromClient = useRetromClient();

  return useMutation({
    mutationFn: async (
      request: MessageInitShape<typeof RestoreSaveFilesFromBackupRequestSchema>,
    ) => retromClient.savesClient.restoreSaveFilesFromBackup(request),

    mutationKey: ["restoreSaveFromBackup"],
  });
}
