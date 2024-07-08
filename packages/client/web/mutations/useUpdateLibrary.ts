import { useToast } from "@/components/ui/use-toast";
import {
  UpdateLibraryRequest,
  UpdateLibraryResponse,
} from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    onError: (err) => {
      toast({
        title: "Error updating library",
        variant: "destructive",
        description: err.message,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          [
            "library",
            "games",
            "platforms",
            "game-metadata",
            "platform-metadata",
          ].some((key) => query.queryKey.includes(key)),
      });

      toast({
        title: "Library updated!",
        description: updateLibrarySuccessMessage(res),
      });
    },
    mutationFn: async () => await retromClient.libraryClient.updateLibrary({}),
  });
}

function updateLibrarySuccessMessage(response: UpdateLibraryResponse) {
  return `Updated: ${response.platformsPopulated.length} platforms, ${response.gamesPopulated.length} games and ${response.gameFilesPopulated.length} game files`;
}
