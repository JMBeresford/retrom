import type { JobProgress } from "@retrom/codegen/retrom/jobs_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useJobProgress() {
  const [jobs, setJobs] = useState<JobProgress[]>([]);
  const retromClient = useRetromClient();

  useQuery({
    queryKey: ["jobs", "job-progress"],
    staleTime: Infinity,
    queryFn: async () => {
      const stream = await retromClient.jobClient.getJobs({});

      for await (const res of stream) {
        const runningJobs = res.jobs.filter(
          (job) => job.percent < 100,
        ) as JobProgress[];

        setJobs(runningJobs);
      }

      return null;
    },
  });

  return jobs;
}
