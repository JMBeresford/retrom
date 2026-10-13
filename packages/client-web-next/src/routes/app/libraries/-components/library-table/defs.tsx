import {
  columnPinningFeature,
  createColumnHelper,
  tableFeatures,
} from "@tanstack/react-table";
import { StructureDefinition } from "./renderers/structure-definition";
import { RowActions } from "./renderers/row-actions";
import { IgnorePatterns } from "./renderers/ignore-patterns";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/library_pb";

export type LibraryTableFeatures = typeof libraryTableFeatures;
export const libraryTableFeatures = tableFeatures({
  columnPinningFeature,
});

const { columns, accessor, display } = createColumnHelper<
  typeof libraryTableFeatures,
  Library
>();

export const libraryTableColumns = columns([
  accessor("displayName", {
    header: "Name",
  }),
  accessor("structureDefinition", {
    header: "Structure Definition",
    cell: (info) => <StructureDefinition row={info.row} />,
  }),
  accessor("ignorePatterns", {
    header: "Ignore Patterns",
    cell: (info) => <IgnorePatterns row={info.row} />,
  }),
  display({
    id: "actions",
    enablePinning: true,
    cell: (info) => <RowActions row={info.row} />,
  }),
]);
