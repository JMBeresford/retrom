import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@retrom/ui-next/components/table";
import { Trash } from "lucide-react";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/models_pb";

export function LibraryTable({ libraries }: { libraries: Array<Library> }) {
  return (
    <Table>
      <TableCaption>Libraries</TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {libraries.map((library) => (
          <TableRow key={library.id}>
            <TableCell>{library.name}</TableCell>
            <TableCell>{library.structureDefinition}</TableCell>
            <TableCell className="text-right">
              <Trash />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      <TableFooter></TableFooter>
    </Table>
  );
}
