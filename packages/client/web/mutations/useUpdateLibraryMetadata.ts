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
          ["jobs"].some((key) => query.queryKey.includes(key)),
      });

      toast({
        title: "Library Metadata Update Started",
        // description: updateMetadataSuccessMessage(res),
      });
    },
    mutationFn: async () =>
      await retromClient.libraryClient.updateLibraryMetadata({}),
  });
}
