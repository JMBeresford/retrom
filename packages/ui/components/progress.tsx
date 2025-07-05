import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1 w-full overflow-hidden rounded-full bg-secondary",
      className,
    )}
    {...props}
  >
    {value ? (
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-accent transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    ) : (
      <div
        className={cn(
          "h-full w-full flex-1 bg-secondary relative flex",
          "*:animate-translate-x",
        )}
      >
        <div className="h-full bg-gradient-to-l from-accent w-full" />
        <div className="h-full bg-gradient-to-r from-accent w-full" />
      </div>
    )}
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
