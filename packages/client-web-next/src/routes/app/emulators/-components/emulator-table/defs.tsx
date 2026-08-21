import {
  columnPinningFeature,
  columnSizingFeature,
  createColumnHelper,
  tableFeatures,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Check, CheckCircle2 } from "lucide-react";
import { RowActions } from "./renderers/row-actions";
import { Platforms } from "./renderers/platforms";
import { OperatingSystems } from "./renderers/operating-systems";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";

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
  accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <Link
        to={`/app/emulators/$emulator-id`}
        params={{ "emulator-id": row.original.id }}
        className="underline"
      >
        {row.original.name}
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
