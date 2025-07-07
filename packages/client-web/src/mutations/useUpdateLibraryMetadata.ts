import { useToast } from "@retrom/ui/hooks/use-toast";
import { JobStatus } from "@retrom/codegen/retrom/jobs_pb";
import { GetJobSubscriptionResponse } from "@retrom/codegen/retrom/services/job-service_pb";
import { MessageInitShape } from "@bufbuild/protobuf";
import { UpdateLibraryMetadataRequestSchema } from "@retrom/codegen/retrom/services/library-service_pb";
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
    onSuccess: async ({
      gameMetadataJobId,
      platformMetadataJobId,
      extraMetadataJobId,
      steamMetadataJobId,
    }) => {
      void queryClient.invalidateQueries({
        predicate: (query) =>
          ["jobs"].some((key) => query.queryKey.includes(key)),
      });

      toast({
        title: "Library Metadata Update Started",
      });

      const gameSubscription = retromClient.jobClient.getJobSubscription({
        jobId: gameMetadataJobId,
      });

      const platformSubscription = retromClient.jobClient.getJobSubscription({
        jobId: platformMetadataJobId,
      });

      const extraSubscription = retromClient.jobClient.getJobSubscription({
        jobId: extraMetadataJobId,
      });

      const steamSubscription = steamMetadataJobId
        ? retromClient.jobClient.getJobSubscription({
            jobId: steamMetadataJobId,
          })
        : undefined;

      async function pollSub(
        subscription: AsyncIterable<GetJobSubscriptionResponse>,
        key: string,
      ) {
        for await (const progress of subscription) {
          if (progress.job?.status === JobStatus.Success) {
            await queryClient.invalidateQueries({
              predicate: ({ queryKey }) => queryKey.includes(key),
            });
          }
        }
      }

      const promises = [
        { subscription: gameSubscription, key: "game-metadata" },
        { subscription: platformSubscription, key: "platform-metadata" },
        { subscription: extraSubscription, key: "game-metadata" },
        { subscription: steamSubscription, key: "game-metadata" },
      ].map(
        ({ subscription, key }) =>
          new Promise<void>((resolve, reject) => {
            if (subscription !== undefined) {
              pollSub(subscription, key)
                .then(() => resolve())
                .catch(reject);
            } else {
              resolve();
            }
          }),
      );

      return Promise.all(promises)
        .then(() => {
          toast({
            title: "Library Metadata Update Complete",
          });
        })
        .catch(console.error);
    },
    mutationFn: (
      req: MessageInitShape<typeof UpdateLibraryMetadataRequestSchema> = {},
    ) => retromClient.libraryClient.updateLibraryMetadata(req),
  });
}
