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
import {
  emulatorProfileTableColumns,
  emulatorProfileTableFeatures,
} from "./defs";
import { Route } from "@/routes/app/emulators/$emulator-id/route";
import { useListEmulatorProfiles } from "@/data/emulators/use-list-emulator-profiles";

export const EmulatorProfileTableKey = "emulator-profile-table" as const;

function alignClassName(align?: "start" | "center" | "end") {
  switch (align) {
    case "start":
      return "text-left";
    case "center":
      return "text-center";
    case "end":
      return "text-right";
    default:
      return "";
  }
}

export function EmulatorProfileTable() {
  const emulatorId = Route.useParams()["emulator-id"];
  const { data, isPending, isError, error, isFetching } =
    useListEmulatorProfiles({
      request: {
        emulatorIds: [emulatorId],
      },
      options: {
        select: (response) => response.emulatorProfiles,
      },
    });

  if (isError && !isFetching) {
    toast.add({
      id: "emulator-profile-table-fetch-error",
      title: "Error loading emulator profiles",
      type: "error",
      description: error.message,
    });
  }

  const table = useTable({
    key: EmulatorProfileTableKey,
    features: emulatorProfileTableFeatures,
    defaultColumn: {
      size: undefined,
    },
    columns: emulatorProfileTableColumns,
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
      <Table className="w-max min-w-full table-auto">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  style={{
                    ["--col-size"]: header.column.columnDef.size
                      ? `${header.column.columnDef.size}px`
                      : "unset",
                  }}
                  className={cn(
                    "w-(--col-size)",
                    alignClassName(header.column.columnDef.meta?.align),
                    "text-sm bg-background text-muted-foreground font-semibold min-w-0",
                    header.column.getIsPinned() &&
                      "sticky right-0 inset-shadow-[1px_0_0_0] inset-shadow-border",
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
              <TableRow
                key={row.id}
                className="isolate bg-background odd:bg-[color-mix(in_srgb,var(--color-background),var(--color-muted)_20%)]"
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "min-w-0",
                      alignClassName(cell.column.columnDef.meta?.align),
                      cell.column.getIsPinned() &&
                        "sticky right-0 bg-inherit text-center inset-shadow-[1px_0_0_0] inset-shadow-border",
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
                No emulators were found. Please add an emulator above.
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
