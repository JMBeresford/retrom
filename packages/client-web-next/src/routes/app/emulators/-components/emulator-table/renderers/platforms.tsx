import { Badge } from "@retrom/ui-next/components/badge";
import { Loader2 } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import type { EmulatorTableFeatures } from "../defs";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import { useListPlatformMetadata } from "@/data/metadata/use-list-metadata";

export function Platforms({
  row,
}: {
  row: Row<EmulatorTableFeatures, Emulator>;
}) {
  const {
    data: platforms,
    isFetching,
    isPending,
    isError,
  } = useListPlatformMetadata({
    request: {
      platformIds: row.original.platforms,
    },
    options: {
      enabled: row.original.platforms.length > 0,
      select: (response) => response.metadata,
    },
  });

  if (row.original.platforms.length === 0) {
    return (
      <span className="text-muted-foreground/50">No platforms configured</span>
    );
  }

  if (isFetching || isPending) {
    return <Loader2 className="animate-spin" />;
  }

  if (isError) {
    return <span className="text-destructive">Error loading platforms</span>;
  }

  return (
    <div className="flex gap-2 items-center">
      {platforms.map((platform) => (
        <Badge key={platform.id} className="mr-1">
          {platform.name}
        </Badge>
      ))}
    </div>
  );
}
