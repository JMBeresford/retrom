import {
  columnPinningFeature,
  columnSizingFeature,
  createColumnHelper,
  tableFeatures,
} from "@tanstack/react-table";
import { Check } from "lucide-react";
import { CustomArgsCell } from "./renderers/custom-args";
import { SupportedExtensionsCell } from "./renderers/supported-extensions";
import { RowActionsCell } from "./renderers/row-actions";
import type { EmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";

export type EmulatorProfileTableColumnMeta = {
  align?: "start" | "center" | "end";
};

const columnMeta: EmulatorProfileTableColumnMeta = {};

export type EmulatorProfileTableFeatures = typeof emulatorProfileTableFeatures;
export const emulatorProfileTableFeatures = tableFeatures({
  columnPinningFeature,
  columnSizingFeature,
  columnMeta,
});

const { columns, accessor, display } = createColumnHelper<
  typeof emulatorProfileTableFeatures,
  EmulatorProfile
>();

export const emulatorProfileTableColumns = columns([
  accessor("name", {
    header: "Name",
    cell: ({ row }) => row.original.name,
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
  accessor("customArgs", {
    header: "Launch Arguments",
    cell: CustomArgsCell,
  }),
  accessor("supportedExtensions", {
    header: "Supported Extensions",
    cell: SupportedExtensionsCell,
  }),
  display({
    id: "actions",
    size: 40,
    enablePinning: true,
    cell: RowActionsCell,
  }),
]);
