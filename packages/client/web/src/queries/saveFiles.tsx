import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import {
  GetSaveFilesRequest,
  GetSaveFilesResponse,
  StatSaveFilesRequest,
} from "@retrom/codegen/retrom/services/saves-service";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

export function useStatSaveFiles(request: StatSaveFilesRequest) {
  const retromClient = useRetromClient();

  return useQuery({
    queryFn: () => retromClient.savesClient.statSaveFiles(request),
    queryKey: ["statSaveFiles", request],
  });
}

export function useGetSaveFiles(request: GetSaveFilesRequest) {
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

        return GetSaveFilesResponse.create({ saveFiles: [] });
      }
    },
    queryKey: ["getSaveFiles", request],
  });
}
