import { Badge } from "@retrom/ui-next/components/badge";
import { Emulator_OperatingSystem } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import type { Row } from "@tanstack/react-table";
import type { EmulatorTableFeatures } from "../defs";

export function OperatingSystems({
  row,
}: {
  row: Row<EmulatorTableFeatures, Emulator>;
}) {
  const operatingSystems = row.original.operatingSystems;
  if (operatingSystems.length === 0) {
    return (
      <span className="text-muted-foreground/50">
        No operating systems configured
      </span>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {operatingSystems.map((os, idx) => (
        <Badge key={`${os}-${idx}`}>{getOperatingSystemName(os)}</Badge>
      ))}
    </div>
  );
}

function getOperatingSystemName(os: Emulator_OperatingSystem): string {
  const value =
    Emulator_OperatingSystem[os] ||
    Emulator_OperatingSystem[Emulator_OperatingSystem.UNSPECIFIED];

  return value.toLocaleLowerCase();
}
