import { cn } from "@retrom/ui-next/lib/utils";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { HTMLAttributes } from "react";
import { usePublicUrl } from "@/api-client/use-public-url";

export type GameBackgroundProps = {
  metadata: GameMetadata;
} & HTMLAttributes<HTMLDivElement>;

export function GameBackground({
  metadata,
  children,
  className,
  ...props
}: GameBackgroundProps) {
  const publicUrl = usePublicUrl(metadata.backgroundUrl);

  return (
    <div
      className={cn(
        "fixed inset-0 -z-1",
        "fade-in animate-in duration-1000",
        className,
      )}
      {...props}
    >
      <img
        src={publicUrl}
        className={cn(
          "object-cover max-w-full h-full w-full blur-3xl",
          "animate-[spin_60s_linear_infinite]",
        )}
      />

      <div
        className={cn(
          "absolute inset-0",
          "bg-linear-to-b from-background to-background/30",
        )}
      />

      {children}
    </div>
  );
}
