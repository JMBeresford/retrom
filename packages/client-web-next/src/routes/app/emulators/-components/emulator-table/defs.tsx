import {
  columnPinningFeature,
  columnSizingFeature,
  createColumnHelper,
  tableFeatures,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { RowActions } from "./renderers/row-actions";
import { Platforms } from "./renderers/platforms";
import { OperatingSystems } from "./renderers/operating-systems";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import { emulatorIdSchema } from "@/data/emulators/resources";

export type EmulatorTableColumnMeta = {
  align?: "start" | "center" | "end";
};

const columnMeta: EmulatorTableColumnMeta = {};

export type EmulatorTableFeatures = typeof emulatorTableFeatures;
export const emulatorTableFeatures = tableFeatures({
  columnPinningFeature,
  columnSizingFeature,
  columnMeta,
});

const { columns, accessor, display } = createColumnHelper<
  typeof emulatorTableFeatures,
  Emulator
>();

export const emulatorTableColumns = columns([
  accessor("displayName", {
    header: "Name",
    cell: ({ row }) => (
      <Link
        to={`/app/emulators/$emulator`}
        params={{ emulator: emulatorIdSchema.parse(row.original.name) }}
        className="underline"
      >
        {row.original.displayName}
      </Link>
    ),
  }),
  accessor("builtIn", {
    header: "Built In",
    meta: { align: "center" },
    cell: ({ row }) =>
      row.original.builtIn ? (
        <span className="flex items-center justify-center">
          <Check size={14} />
        </span>
      ) : null,
  }),
  accessor("platforms", {
    header: "Supported Platforms",
    cell: ({ row }) => <Platforms row={row} />,
  }),
  accessor("operatingSystems", {
    header: "Supported Operating Systems",
    cell: ({ row }) => <OperatingSystems row={row} />,
  }),
  display({
    id: "actions",
    size: 40,
    enablePinning: true,
    cell: (info) => <RowActions row={info.row} />,
  }),
]);
