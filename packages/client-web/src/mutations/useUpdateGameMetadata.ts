import { useToast } from "@retrom/ui/hooks/use-toast";
import { UpdateGameMetadataRequestSchema } from "@retrom/codegen/retrom/services/metadata-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create, MessageInitShape } from "@bufbuild/protobuf";

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
    mutationFn: async (
      req: MessageInitShape<typeof UpdateGameMetadataRequestSchema>,
    ) =>
      retromClient.metadataClient.updateGameMetadata(
        create(UpdateGameMetadataRequestSchema, req),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("games") ||
          query.queryKey.includes("game-metadata"),
      }),
  });
}
