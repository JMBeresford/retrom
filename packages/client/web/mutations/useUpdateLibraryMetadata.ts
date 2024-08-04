import { useToast } from "@/components/ui/use-toast";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateLibraryMetadata() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    onError: (err) => {
      toast({
        title: "Error updating library metadata",
        variant: "destructive",
        description: err.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["game-metadata", "platform-metadata"].some((key) =>
            query.queryKey.includes(key),
          ),
      });

      toast({
        title: "Library metadata updated!",
        // description: updateMetadataSuccessMessage(res),
      });
    },
    mutationFn: async () => {
      const stream = retromClient.libraryClient.updateLibraryMetadata({});

      for await (const response of stream) {
        console.log(response);
      }
    },
  });
}

// function updateMetadataSuccessMessage(response: UpdateLibraryMetadataResponse) {
//   const gameMetadata = response.gameMetadataPopulated.length;
//   const platformMetadata = response.platformMetadataPopulated.length;
//
//   return `Updated: ${gameMetadata} game metadata entries, ${platformMetadata} platform metadata entries`;
// }
