import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import {
  GetSaveStatesRequest,
  GetSaveStatesResponseSchema,
  StatSaveStatesRequest,
} from "@retrom/codegen/retrom/services/saves-service_pb";
import { toast } from "@retrom/ui/hooks/use-toast";
import { Progress } from "@retrom/ui/components/progress";
import { RawMessage } from "@/utils/protos";
import { create } from "@bufbuild/protobuf";

export function useStatSaveStates(request: RawMessage<StatSaveStatesRequest>) {
  const retromClient = useRetromClient();

  return useQuery({
    queryFn: () => retromClient.savesClient.statSaveStates(request),
    queryKey: ["statSaveStates", request],
  });
}

export function useGetSaveStates(request: RawMessage<GetSaveStatesRequest>) {
  const retromClient = useRetromClient();

  return useQuery({
    queryFn: async () => {
      const { dismiss } = toast({
        id: "download-remote-saves",
        duration: Infinity,
        title: "Downloading Save States",
        description: <Progress />,
      });

      try {
        const res = await retromClient.savesClient.getSaveStates(request);

        dismiss();
        toast({
          title: "Save states downloaded",
          description: "Your save states have been downloaded successfully",
          duration: 3000,
        });

        return res;
      } catch (error) {
        dismiss();
        toast({
          title: "Failed to download save states",
          duration: 5000,
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          variant: "destructive",
        });

        return create(GetSaveStatesResponseSchema, { saveStates: [] });
      }
    },
    queryKey: ["getSaveStates", request],
  });
}
