import { TableCell, TableRow } from "@retrom/ui-next/components/table";
import { useForm } from "@tanstack/react-form";
import { librarySchema } from "./schema";
import type z from "zod";

export function CreateLibraryForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      path: "",
      ignorePatterns: {
        patterns: Array<string>(),
      },
      structureDefinition: "",
    } satisfies z.output<typeof librarySchema>,
    validators: {
      onChange: librarySchema,
    },
  });

  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
}
