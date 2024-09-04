import { useToast } from "@/components/ui/use-toast";
import { UpdateGameMetadataRequest } from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateGameMetadata() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["updateGameMetadata"],
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error updating metadata",
        description: "Check the console for details",
        variant: "destructive",
      });
    },
    mutationFn: async (req: UpdateGameMetadataRequest) => {
      return await retromClient.metadataClient.updateGameMetadata(req);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("games") ||
          query.queryKey.includes("game-metadata"),
      }),
  });
}
