import { Badge } from "@retrom/ui-next/components/badge";
import type { Row } from "@tanstack/react-table";
import type { EmulatorProfileTableFeatures } from "../defs";
import type { EmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";

export function SupportedExtensionsCell({
  row,
}: {
  row: Row<EmulatorProfileTableFeatures, EmulatorProfile>;
}) {
  const extensions = row.original.supportedExtensions;
  if (extensions.length === 0) {
    return (
      <span className="text-muted-foreground/50">No extensions configured</span>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {extensions.map((ext) => (
        <Badge key={ext} className="mr-1">
          {ext}
        </Badge>
      ))}
    </div>
  );
}
