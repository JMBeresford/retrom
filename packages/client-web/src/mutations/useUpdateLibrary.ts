import { useToast } from "@retrom/ui/hooks/use-toast";
import { JobStatus } from "@retrom/codegen/retrom/jobs_pb";
import { GetJobSubscriptionResponse } from "@retrom/codegen/retrom/services/job-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSteamInstallations } from "@retrom/plugin-installer";
import { checkIsDesktop } from "@/lib/env";

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
    onSuccess: ({ jobIds }) => {
      toast({
        title: "Library update started!",
      });

      const subscriptions = jobIds.map((jobId) =>
        retromClient.jobClient.getJobSubscription({
          jobId,
        }),
      );

      async function invalidate() {
        return queryClient
          .invalidateQueries({
            predicate: (query) =>
              [
                "library",
                "games",
                "platforms",
                "game-metadata",
                "platform-metadata",
                "installation-index",
              ].some((key) => query.queryKey.includes(key)),
          })
          .catch(console.error);
      }

      async function pollSub(
        subscription: AsyncIterable<GetJobSubscriptionResponse>,
      ) {
        for await (const progress of subscription) {
          if (progress.job?.status === JobStatus.Success) {
            await invalidate();

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

      Promise.all(promises)
        .then(async () => {
          if (checkIsDesktop()) {
            await updateSteamInstallations();
          }

          return invalidate();
        })
        .catch(console.error);
    },
    mutationFn: () => retromClient.libraryClient.updateLibrary({}),
  });
}
