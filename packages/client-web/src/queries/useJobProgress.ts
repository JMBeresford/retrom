import { JobProgress } from "@retrom/codegen/retrom/jobs_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useJobProgress() {
  const [jobs, setJobs] = useState<JobProgress[]>([]);
  const retromClient = useRetromClient();

  useQuery({
    queryKey: ["jobs", "job-progress"],
    retry: true,
    queryFn: async () => {
      const stream = retromClient.jobClient.getJobs({});

      for await (const res of stream) {
        const runningJobs = res.jobs.filter((job) => job.percent < 100);

        setJobs(runningJobs);
      }

      // throw error to trigger a retry, we want this stream
      // to be always open
      throw new Error("Job progress stream ended");
    },
  });

  return jobs;
}
