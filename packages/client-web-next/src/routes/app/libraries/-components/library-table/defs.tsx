import {
  columnPinningFeature,
  createColumnHelper,
  tableFeatures,
} from "@tanstack/react-table";
import { FilePath } from "@retrom/ui-next/components/file-path";
import { StructureDefinition } from "./renderers/structure-definition";
import { RowActions } from "./renderers/row-actions";
import { IgnorePatterns } from "./renderers/ignore-patterns";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/resources_pb";

export type LibraryTableFeatures = typeof libraryTableFeatures;
export const libraryTableFeatures = tableFeatures({
  columnPinningFeature,
});

const { columns, accessor, display } = createColumnHelper<
  typeof libraryTableFeatures,
  Library
>();

export const libraryTableColumns = columns([
  accessor("name", {
    header: "Name",
  }),
  accessor("path", {
    header: "Path",
    cell: (info) => <FilePath>{info.getValue()}</FilePath>,
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
