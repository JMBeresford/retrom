import { ChevronRight, ServerCrash } from "lucide-react";
import { cn } from "@retrom/ui-next/lib/utils";
import { buttonVariants } from "@retrom/ui-next/components/button-variants";
import type { HTMLAttributes } from "react";
import { useGetServerInfo } from "@/data/config/use-get-server-info";

export function ServerStatus({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  const { isError } = useGetServerInfo();

  return (
    <span
      hidden={!isError}
      className={cn(
        className,
        buttonVariants({ variant: "destructive" }),
        "hover:text-destructive h-12 justify-start",
      )}
      {...props}
    >
      <ServerCrash />

      <span className="w-full flex items-center justify-between">
        <span className="flex flex-col items-start">
          <span className="font-bold">Not connected</span>
          <span className="text-xs opacity-80">Click for more details</span>
        </span>
        <ChevronRight />
      </span>
    </span>
  );
}
