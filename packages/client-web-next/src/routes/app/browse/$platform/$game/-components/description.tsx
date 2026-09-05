import { ScrollArea } from "@retrom/ui-next/components/scroll-area";
import { cn } from "@retrom/ui-next/lib/utils";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { HTMLAttributes } from "react";

export type DescriptionProps = {
  metadata: GameMetadata;
} & HTMLAttributes<HTMLDivElement>;

export function Description({
  metadata,
  className,
  ...props
}: DescriptionProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col justify-between gap-4 h-full max-h-45",
        "shadow-lg rounded-md border p-4 bg-background/30",
        className,
      )}
      {...props}
    >
      <ScrollArea className="flex flex-col pr-4 overflow-hidden">
        <p className="text-pretty">{metadata.description}</p>
      </ScrollArea>
    </div>
  );
}
