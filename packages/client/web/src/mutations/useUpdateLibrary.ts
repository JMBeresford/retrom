import { useToast } from "@/components/ui/use-toast";
import { JobStatus } from "@retrom/codegen/retrom/jobs";
import { GetJobSubscriptionResponse } from "@retrom/codegen/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSteamInstallations } from "@retrom/plugin-installer";

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
      void queryClient.invalidateQueries({
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
        void queryClient.invalidateQueries({
          predicate: (query) =>
            [
              "library",
              "games",
              "platforms",
              "game-metadata",
              "platform-metadata",
              "installation-state",
            ].some((key) => query.queryKey.includes(key)),
        });
      }

      async function pollSub(
        subscription: AsyncIterable<GetJobSubscriptionResponse>,
      ) {
        for await (const progress of subscription) {
          if (progress.job?.status === JobStatus.Success) {
            invalidate();

            toast({
              title: `Job complete: ${progress.job?.name}!`,
            });
          }
        }
      }

      const promises = subscriptions.map(
        (subscription) =>
          new Promise<void>((resolve, reject) => {
            if (subscription !== undefined) {
              pollSub(subscription)
                .then(() => resolve())
                .catch(reject);
            } else {
              resolve();
            }
          }),
      );

      await Promise.all(promises);
      await updateSteamInstallations();
      invalidate();
    },
    mutationFn: () => retromClient.libraryClient.updateLibrary({}),
  });
}
