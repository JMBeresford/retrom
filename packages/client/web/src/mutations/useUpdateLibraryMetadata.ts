import { useToast } from "@/components/ui/use-toast";
import { JobStatus } from "@/generated/retrom/jobs";
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
      queryClient.invalidateQueries({
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

      function invalidate(key: string = "game-metadata") {
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey.includes(key),
        });
      }

      for await (const progress of gameSubscription) {
        if (progress.job?.status === JobStatus.Success) {
          invalidate();
        }
      }

      for await (const progress of platformSubscription) {
        if (progress.job?.status === JobStatus.Success) {
          invalidate("platform-metadata");
        }
      }

      for await (const progress of extraSubscription) {
        if (progress.job?.status === JobStatus.Success) {
          invalidate();
        }
      }

      if (steamSubscription !== undefined) {
        for await (const progress of steamSubscription) {
          if (progress.job?.status === JobStatus.Success) {
            invalidate();
          }
        }
      }

      toast({
        title: "Library Metadata Update Complete",
      });
    },
    mutationFn: async () =>
      await retromClient.libraryClient.updateLibraryMetadata({}),
  });
}
