import { useToast } from "@/components/ui/use-toast";
import { JobStatus } from "@/generated/retrom/jobs";
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
    onSuccess: async ({ jobId }) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["jobs"].some((key) => query.queryKey.includes(key)),
      });

      toast({
        title: "Library update started!",
      });

      const subscription = retromClient.jobClient.getJobSubscription({
        jobId,
      });

      function invalidate() {
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
      }

      for await (const progress of subscription) {
        if (progress.job?.status === JobStatus.Success) {
          invalidate();
          return;
        }
      }

      invalidate();
    },
    mutationFn: async () => await retromClient.libraryClient.updateLibrary({}),
  });
}
