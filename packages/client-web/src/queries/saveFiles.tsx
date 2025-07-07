import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import {
  GetSaveFilesRequestSchema,
  GetSaveFilesResponseSchema,
  StatSaveFilesRequestSchema,
} from "@retrom/codegen/retrom/services/saves-service_pb";
import { toast } from "@retrom/ui/hooks/use-toast";
import { Progress } from "@retrom/ui/components/progress";
import { create, MessageInitShape } from "@bufbuild/protobuf";

export function useStatSaveFiles(
  request: MessageInitShape<typeof StatSaveFilesRequestSchema>,
) {
  const retromClient = useRetromClient();

  return useQuery({
    queryFn: () => retromClient.savesClient.statSaveFiles(request),
    queryKey: ["statSaveFiles", request],
  });
}

export function useGetSaveFiles(
  request: MessageInitShape<typeof GetSaveFilesRequestSchema>,
) {
  const retromClient = useRetromClient();

  return useQuery({
    queryFn: async () => {
      const { dismiss } = toast({
        id: "download-remote-saves",
        duration: Infinity,
        title: "Downloading Save Files",
        description: <Progress />,
      });

      try {
        const res = await retromClient.savesClient.getSaveFiles(request);

        dismiss();
        toast({
          title: "Save files downloaded",
          description: "Your save files have been downloaded successfully",
          duration: 3000,
        });

        return res;
      } catch (error) {
        dismiss();
        toast({
          title: "Failed to download save files",
          duration: 5000,
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          variant: "destructive",
        });

        return create(GetSaveFilesResponseSchema, { saveFiles: [] });
      }
    },
    queryKey: ["getSaveFiles", request],
  });
}
