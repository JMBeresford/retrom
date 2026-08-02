import { EditLibraryAction } from "./edit-library-action";
import { DeleteLibraryAction } from "./delete-library-action";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import type { Row } from "@tanstack/react-table";
import type { LibraryTableFeatures } from "../defs";

export function RowActions({
  row,
}: {
  row: Row<LibraryTableFeatures, Library>;
}) {
  return (
    <div className="flex gap-2 justify-end">
      <EditLibraryAction libraryId={row.original.id} />
      <DeleteLibraryAction libraryId={row.original.id} />
    </div>
  );
}
