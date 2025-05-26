import { JobProgress, JobStatus } from "@retrom/codegen/retrom/jobs_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useJobSubscription(opts: {
  jobId: string;
  onProgress?: (progress: JobProgress) => unknown;
  onCompletion?: (progress: JobProgress) => unknown;
}) {
  const { jobId, onProgress, onCompletion } = opts;
  const retromClient = useRetromClient();
  const [jobProgress, setJobProgress] = useState<JobProgress | undefined>(
    undefined,
  );

  useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const stream = retromClient.jobClient.getJobSubscription({ jobId });

      for await (const progress of stream) {
        const { job } = progress;

        if (job) {
          if (onProgress && job.status === JobStatus.Running) {
            onProgress(job);
          }

          if (onCompletion && job.status === JobStatus.Success) {
            onCompletion(job);
          }

          setJobProgress(job);
        }
      }

      return null;
    },
  });

  return jobProgress;
}
