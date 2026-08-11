import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@retrom/ui-next/components/table";
import { useTable } from "@tanstack/react-table";
import { cn } from "@retrom/ui-next/lib/utils";
import { ScrollArea, ScrollBar } from "@retrom/ui-next/components/scroll-area";
import { Skeleton } from "@retrom/ui-next/components/skeleton";
import { toast } from "@retrom/ui-next/components/toast";
import { libraryTableColumns, libraryTableFeatures } from "./defs";
import { useListLibraries } from "@/data/libraries/use-list-libraries";

export const LibraryTableKey = "library-table" as const;

export function LibraryTable() {
  const { data, isPending, isError, error, isFetching } = useListLibraries({
    options: {
      select: (response) => response.libraries,
    },
  });

  if (isError && !isFetching) {
    toast.add({
      id: "library-table-fetch-error",
      title: "Error loading libraries",
      type: "error",
      description: error.message,
    });
  }

  const table = useTable({
    key: LibraryTableKey,
    features: libraryTableFeatures,
    columns: libraryTableColumns,
    data: data ?? [],
    initialState: {
      columnPinning: {
        start: [],
        end: ["actions"],
      },
    },
  });

  const rows = table.getRowModel().rows;

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
          {isPending ? (
            <RowSkeletons />
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id} className="isolate">
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.getIsPinned() &&
                        "sticky right-0 bg-background text-center inset-shadow-[1px_0_0_0] inset-shadow-border",
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={100}
                className="p-10 text-center text-muted-foreground"
              >
                No libraries were found. Please add a library above.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function RowSkeletons() {
  return Array.from({ length: 10 }).map((_, index) => (
    <TableRow key={index} className="isolate">
      <TableCell colSpan={100} className={cn("h-10")}>
        <Skeleton
          style={{ "--delay": `${-200 * index}ms` }}
          className="h-full delay-(--delay)"
        />
      </TableCell>
    </TableRow>
  ));
}
