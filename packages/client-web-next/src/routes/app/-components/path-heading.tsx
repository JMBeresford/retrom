import { cn } from "@retrom/ui-next/lib/utils";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
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
    <span className={cn("flex gap-2", className)} {...props}>
      {segments.map(({ link, label }, index) => (
        <Fragment key={index}>
          <Link
            className={cn(
              "transition-colors",
              "font-heading text-4xl font-bold",
              "hover:text-foreground whitespace-nowrap",
              index === segments.length - 1 && "overflow-hidden text-ellipsis",
            )}
            inactiveProps={{ className: "text-muted-foreground/50" }}
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
            {...link}
          >
            {label}
          </Link>

          <span className="font-heading text-4xl font-bold text-muted-foreground last:hidden">
            /
          </span>
        </Fragment>
      ))}
    </span>
  );
}
