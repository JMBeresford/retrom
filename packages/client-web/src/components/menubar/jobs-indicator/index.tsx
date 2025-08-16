import { Button } from "@retrom/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@retrom/ui/components/popover";
import { Progress } from "@retrom/ui/components/progress";
import { JobProgress, JobStatus } from "@retrom/codegen/retrom/jobs_pb";
import { cn } from "@retrom/ui/lib/utils";
import { useJobProgress } from "@/queries/useJobProgress";
import { LoaderCircleIcon } from "lucide-react";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
  PaginationProvider,
  usePaginationContext,
} from "@retrom/ui/components/pagination";

const PAGE_SIZE = 10;

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

      <PopoverContent align="end" className="w-fit">
        <div className="flex flex-col overflow-hidden gap-3">
          {jobs.length === 0 ? (
            <div className="pt-4 text-center text-muted-foreground">
              No jobs are running
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold">Running Background Jobs</h4>
            </div>
          )}

          <PaginationProvider pageSize={10} totalItems={jobs.length}>
            <ScrollArea
              className={cn(
                "flex flex-col p-2 rounded-sm bg-muted max-h-[60dvh]",
                jobs.length > PAGE_SIZE && "h-96",
              )}
            >
              <JobList jobs={jobs} />
            </ScrollArea>

            <JobPages />
          </PaginationProvider>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function JobList(props: { jobs: JobProgress[] }) {
  const { jobs } = props;
  const { pageStart, pageEnd } = usePaginationContext();

  return jobs.slice(pageStart, pageEnd + 1).map((job, idx) => (
    <div key={idx} className="border-b py-2">
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
        {job.percent ? (
          <p className="text-xs font-semibold text-muted-foreground">
            {job.percent}%
          </p>
        ) : null}
      </div>
    </div>
  ));
}

function JobPages() {
  const { pageStart, pageEnd, totalItems, numPages } = usePaginationContext();

  if (numPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationFirst />
        </PaginationItem>

        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>

        <PaginationItem className="text-xs text-muted-foreground font-mono">
          {pageStart + 1} - {pageEnd + 1} of {totalItems}
        </PaginationItem>

        <PaginationItem>
          <PaginationNext />
        </PaginationItem>

        <PaginationItem>
          <PaginationLast />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
