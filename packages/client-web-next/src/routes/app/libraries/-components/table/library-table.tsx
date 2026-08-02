import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@retrom/ui-next/components/table";
import { useTable } from "@tanstack/react-table";
import { create } from "@bufbuild/protobuf";
import { LibrarySchema } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import { cn } from "@retrom/ui-next/lib/utils";
import { ScrollArea, ScrollBar } from "@retrom/ui-next/components/scroll-area";
import { libraryTableColumns, libraryTableFeatures } from "./defs";
import { useListLibraries } from "@/data/libraries/use-list-libraries";

export const LibraryTableKey = "library-table" as const;

const libraries = [
  create(LibrarySchema, {
    id: "1",
    name: "foo",
    path: "/games/lib1",
    structureDefinition: "{library}/foo/bar/{platform}",
  }),
  create(LibrarySchema, {
    id: "2",
    name: "bar",
    path: "/games/lib2",
    structureDefinition: "{library}/{platform}/{game}",
  }),
];

export function LibraryTable() {
  const { data = [] } = useListLibraries({
    options: {
      select: (response) => response.libraries,
    },
  });

  const table = useTable({
    key: LibraryTableKey,
    features: libraryTableFeatures,
    columns: libraryTableColumns,
    data: libraries,
    initialState: {
      columnPinning: {
        start: [],
        end: ["actions"],
      },
    },
  });

  return (
    <ScrollArea className="w-full pb-2">
      <Table className="w-max min-w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className={cn(
                    "text-sm text-muted-foreground font-semibold",
                    header.column.getIsPinned() &&
                      "sticky right-0 bg-background",
                  )}
                  key={header.id}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="isolate">
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    cell.column.getIsPinned() &&
                      "sticky right-0 bg-background text-right inset-shadow-[1px_0_0_0] inset-shadow-border",
                  )}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
