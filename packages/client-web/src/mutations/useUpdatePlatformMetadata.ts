import { useToast } from "@retrom/ui/hooks/use-toast";
import { UpdatePlatformMetadataRequestSchema } from "@retrom/codegen/retrom/services/metadata-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useUpdatePlatformMetadata() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["updatePlatformMetadata"],
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error updating metadata",
        description: "Check the console for details",
        variant: "destructive",
      });
    },
    mutationFn: async (
      req: MessageInitShape<typeof UpdatePlatformMetadataRequestSchema>,
    ) => {
      return await retromClient.metadataClient.updatePlatformMetadata(req);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("platforms") ||
          query.queryKey.includes("platform-metadata"),
      }),
  });
}
