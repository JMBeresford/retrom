import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { JobStatus } from "@retrom/codegen/retrom/jobs_pb";
import { cn } from "@/lib/utils";
import { useJobProgress } from "@/queries/useJobProgress";
import { LoaderCircleIcon } from "lucide-react";
import { Fragment } from "react";

export function JobsIndicator(props: JSX.IntrinsicElements["button"]) {
  const { className, ...rest } = props;
  const jobs = useJobProgress();

  if (!jobs.length) return null;

  return (
    <Popover>
      <PopoverTrigger {...rest} asChild className={cn("", className)}>
        <Button variant="ghost" size="icon" className="h-min w-min p-1">
          <LoaderCircleIcon className="animate-spin text-muted-foreground h-[1.2rem] w-[1.2rem]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end">
        {jobs.map((job, idx) => (
          <Fragment key={job.name}>
            {idx !== 0 ? <Separator className="my-3" /> : null}

            <div>
              <h5
                className={cn(
                  "font-semibold text-sm leading-none",
                  job.status === JobStatus.Failure && "text-destructive-text",
                )}
              >
                {job.name}
              </h5>

              <div className="flex gap-2 items-stretch mt-1">
                <Progress value={job.percent} className={cn("h-1 mt-2")} />
                <p className="text-xs font-semibold text-muted-foreground">
                  {job.percent}%
                </p>
              </div>
            </div>
          </Fragment>
        ))}

        {jobs.length === 0 && (
          <div className="pt-4 text-center text-muted-foreground">
            No jobs are running
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
