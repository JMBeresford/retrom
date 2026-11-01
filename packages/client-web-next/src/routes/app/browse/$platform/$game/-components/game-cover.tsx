import { cn } from "@retrom/ui-next/lib/utils";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { HTMLAttributes } from "react";
import { usePublicUrl } from "@/api-client/use-public-url";

export type GameCoverProps = {
  metadata: GameMetadata;
} & HTMLAttributes<HTMLDivElement>;

export function GameCover({ metadata, className, ...props }: GameCoverProps) {
  const publicUrl = usePublicUrl(metadata.coverUrl);

  return (
    <div
      className={cn(
        "aspect-3/4 rounded-lg overflow-hidden border",
        "shadow-xl",
        className,
      )}
      {...props}
    >
      <img src={publicUrl} />
    </div>
  );
}
