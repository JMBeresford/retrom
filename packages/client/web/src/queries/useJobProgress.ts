import { JobProgress } from "@/generated/retrom/jobs";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useJobProgress() {
  const [jobs, setJobs] = useState<JobProgress[]>([]);
  const retromClient = useRetromClient();

  useQuery({
    queryKey: ["jobs", "job-progress"],
    queryFn: async () => {
      const stream = retromClient.jobClient.getJobs({});

      for await (const res of stream) {
        const runningJobs = res.jobs.filter((job) => job.percent < 100);

        setJobs(runningJobs);
      }

      return stream;
    },
  });

  return jobs;
}
