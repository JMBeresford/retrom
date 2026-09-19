import { cn } from "@retrom/ui-next/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@retrom/ui-next/components/tooltip";
import { ChevronRightIcon } from "lucide-react";
import type { LinkComponentProps } from "@tanstack/react-router";
import type { HTMLAttributes } from "react";

export type PathHeadingSegment = {
  link: LinkComponentProps;
  label: string;
};

export type PathHeadingProps = {
  segments: Array<PathHeadingSegment>;
} & HTMLAttributes<HTMLSpanElement>;

export function PathHeading({
  segments,
  className,
  ...props
}: PathHeadingProps) {
  return (
    <TooltipProvider>
      <span className={cn("flex gap-2 items-baseline", className)} {...props}>
        {segments.map(({ link, label }, index) => (
          <Tooltip key={index}>
            <TooltipTrigger
              disabled={index !== segments.length - 1}
              render={
                <Link
                  className={cn(
                    "transition-colors",
                    "font-heading text-4xl font-bold",
                    "hover:text-foreground dark:hover:text-foreground whitespace-nowrap",
                    index === segments.length - 1 &&
                      "overflow-hidden text-ellipsis",
                  )}
                  inactiveProps={{
                    className:
                      "text-foreground/50 dark:text-muted-foreground/50",
                  }}
                  activeProps={{ className: "text-foreground" }}
                  activeOptions={{ exact: true }}
                  {...link}
                >
                  {label}
                </Link>
              }
            />

            <TooltipContent>{label}</TooltipContent>

            <span className="text-muted-foreground last:hidden">
              <ChevronRightIcon />
            </span>
          </Tooltip>
        ))}
      </span>
    </TooltipProvider>
  );
}
