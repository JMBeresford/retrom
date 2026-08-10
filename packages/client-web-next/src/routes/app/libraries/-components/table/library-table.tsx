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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@retrom/ui-next/components/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@retrom/ui-next/components/collapsible";
import { AlertCircleIcon, ChevronDownIcon } from "lucide-react";
import { libraryTableColumns, libraryTableFeatures } from "./defs";
import { useListLibraries } from "@/data/libraries/use-list-libraries";

export const LibraryTableKey = "library-table" as const;

export function LibraryTable() {
  const { data, isPending, isError, error } = useListLibraries({
    options: {
      select: (response) => response.libraries,
    },
  });

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
          ) : isError ? (
            <div className="absolute w-full grid place-items-center p-10">
              <Alert variant="destructive" className="w-auto">
                <AlertCircleIcon />
                <AlertTitle>Error fetching libraries</AlertTitle>
                <AlertDescription className="max-w-[40ch]">
                  There was an error fetching the libraries. Please check your
                  connection and try again later.
                  <Collapsible className="mt-4">
                    <CollapsibleTrigger className="w-full flex items-center justify-between text-muted-foreground group/button">
                      Error Details
                      <ChevronDownIcon className="group-data-panel-open/button:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-muted text-muted-foreground rounded p-2">
                      {error.message}
                    </CollapsibleContent>
                  </Collapsible>
                </AlertDescription>
              </Alert>
            </div>
          ) : rows.length > 0 ? (
            rows.map((row) => (
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
