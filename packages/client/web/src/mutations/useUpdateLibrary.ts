import { useToast } from "@/components/ui/use-toast";
import { JobStatus } from "@/generated/retrom/jobs";
import { GetJobSubscriptionResponse } from "@/generated/retrom/services";
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
    onSuccess: async ({ jobIds }) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["jobs"].some((key) => query.queryKey.includes(key)),
      });

      toast({
        title: "Library update started!",
      });

      const subscriptions = jobIds.map((jobId) =>
        retromClient.jobClient.getJobSubscription({
          jobId,
        }),
      );

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

      async function waitForJobCompletion(
        sub: AsyncIterable<GetJobSubscriptionResponse>,
      ) {
        for await (const progress of sub) {
          console.log(progress);
          if (progress.job?.status === JobStatus.Success) {
            invalidate();

            toast({
              title: `Job complete: ${progress.job?.name}!`,
            });

            return;
          }
        }
      }

      for (const subscription of subscriptions) {
        void waitForJobCompletion(subscription);
      }

      invalidate();
    },
    mutationFn: async () => await retromClient.libraryClient.updateLibrary({}),
  });
}
