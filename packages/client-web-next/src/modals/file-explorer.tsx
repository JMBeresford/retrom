import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@retrom/ui-next/components/breadcrumb";
import { cn } from "@retrom/ui-next/lib/utils";
import {
  FileIcon,
  FolderIcon,
  HardDriveIcon,
  Loader2,
  SlashIcon,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui-next/components/dialog";
import { ScrollArea } from "@retrom/ui-next/components/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@retrom/ui-next/components/table";
import { Button } from "@retrom/ui-next/components/button";
import { keepPreviousData } from "@tanstack/react-query";
import { FileType } from "@retrom/codegen/retrom/services/files/v1/file_pb";
import { registerModalHandle } from "./use-modal-action";
import type { ReactElement } from "react";
import type { LucideProps } from "lucide-react";
import type { BaseModalActionProps } from "./modals";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { ExploreHostPathsRequestSchema } from "@retrom/codegen/retrom/services/files/v1/file_service_pb";
import { useExploreHostPaths } from "@/data/files/use-explore-host-paths";

export type FileExplorerDialogProps = BaseModalActionProps & {
  onConfirm: (path: string) => void | Promise<void>;
  initialPath?: string;
};

declare global {
  namespace RetromModals {
    interface ModalActions {
      fileExplorer: FileExplorerDialogProps;
    }
  }
}

const handle = Dialog.createHandle<FileExplorerDialogProps>();
registerModalHandle("fileExplorer", handle);

const FilesystemNodeIcon: Record<
  FileType,
  (props: LucideProps) => ReactElement
> = {
  [FileType.DIRECTORY]: ({ className, ...props }) => (
    <FolderIcon {...props} className={cn("fill-primary stroke-0", className)} />
  ),
  [FileType.FILE]: ({ className, ...props }) => (
    <FileIcon
      className={cn("fill-muted-foreground stroke-2 stroke-muted", className)}
      {...props}
    />
  ),
  [FileType.UNSPECIFIED]: () => <></>,
};

const MAX_CRUMBS = 3;

export function FileExplorerDialog() {
  const [path, setPath] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<string | undefined>();

  const request = useMemo(
    () =>
      ({ absolutePath: path }) satisfies MessageInitShape<
        typeof ExploreHostPathsRequestSchema
      >,
    [path],
  );

  const { data, isError, isFetching } = useExploreHostPaths({
    request,
    options: {
      placeholderData: keepPreviousData,
    },
  });

  const pathParts = path.split("/").filter(Boolean);

  return (
    <Dialog
      handle={handle}
      onOpenChange={(open) => {
        const { payload } = handle.store.getSnapshot();
        if (open) {
          setPath(payload?.initialPath || "");
        } else {
          setPath("");
        }
      }}
    >
      {({ payload }) => {
        const confirm = async (currentPath?: string) => {
          if (currentPath !== undefined) {
            await payload?.onConfirm(currentPath);
          }

          handle.close();
        };

        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File Explorer</DialogTitle>
              <DialogDescription className="max-w-[65ch]">
                These are the files on the Retrom server. If you are using
                standalone mode, then these are also the local files on your
                computer.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-fit rounded border relative">
              <div className="max-h-100 relative">
                <Table
                  className={cn(
                    "min-w-100",
                    isFetching && "opacity-50 pointer-events-none touch-none",
                  )}
                >
                  <TableHeader className="[&_tr]:border-b-0 sticky top-0">
                    <TableRow>
                      <TableHead colSpan={2} className="p-0 h-min">
                        <Breadcrumb className="bg-muted py-2 px-4 border-b select-none">
                          <BreadcrumbList>
                            <BreadcrumbItem onClick={() => setPath(`/`)}>
                              <HardDriveIcon
                                className={cn(
                                  "size-5 stroke-muted-foreground",
                                  pathParts.length === 0 && "stroke-foreground",
                                  "cursor-pointer hover:stroke-foreground transition-colors",
                                )}
                              />
                            </BreadcrumbItem>

                            {pathParts.length ? (
                              <BreadcrumbSeparator>
                                <SlashIcon />
                              </BreadcrumbSeparator>
                            ) : null}

                            <BreadcrumbItem
                              onClick={() => setPath(`/${pathParts.at(0)}`)}
                              className={cn(
                                pathParts.length === 1 && "text-foreground",
                                "cursor-pointer hover:text-foreground transition-colors",
                              )}
                            >
                              {pathParts.at(0)}
                            </BreadcrumbItem>

                            {pathParts.length > MAX_CRUMBS && (
                              <>
                                <BreadcrumbSeparator>
                                  <SlashIcon />
                                </BreadcrumbSeparator>
                                <BreadcrumbEllipsis className="h-min" />
                              </>
                            )}

                            {pathParts
                              .slice(
                                pathParts.length > MAX_CRUMBS
                                  ? -(MAX_CRUMBS - 1)
                                  : 1,
                              )
                              .map((part, index, parts) => {
                                const indexFromEnd =
                                  (pathParts.length > MAX_CRUMBS
                                    ? MAX_CRUMBS - 1
                                    : pathParts.length - 1) -
                                  index -
                                  1;

                                const crumbPath =
                                  "/" +
                                  pathParts.slice(0, -indexFromEnd).join("/");

                                return (
                                  <Fragment key={index}>
                                    <BreadcrumbSeparator>
                                      <SlashIcon />
                                    </BreadcrumbSeparator>

                                    {index === parts.length - 1 ? (
                                      <BreadcrumbPage>{part}</BreadcrumbPage>
                                    ) : (
                                      <BreadcrumbItem
                                        onClick={() => setPath(crumbPath)}
                                        className="cursor-pointer hover:text-foreground transition-colors"
                                      >
                                        {part}
                                      </BreadcrumbItem>
                                    )}
                                  </Fragment>
                                );
                              })}
                          </BreadcrumbList>
                        </Breadcrumb>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.nodes.map((node) => {
                      const Icon = node.isDirectory
                        ? FilesystemNodeIcon[FileType.DIRECTORY]
                        : FilesystemNodeIcon[FileType.FILE];

                      return (
                        <TableRow
                          key={node.absolutePath}
                          onClick={() => setSelectedPath(node.absolutePath)}
                          onDoubleClick={() =>
                            node.isDirectory
                              ? setPath(node.absolutePath)
                              : confirm(node.absolutePath)
                          }
                          className={cn(
                            "cursor-pointer *:py-2 border-b last:border-b-0 first:border-t-0",
                            selectedPath === node.absolutePath &&
                              "bg-accent/30 hover:bg-accent/30",
                          )}
                        >
                          <TableCell>
                            <Icon size={"1rem"} />
                          </TableCell>
                          <TableCell className="w-full select-none font-mono">
                            {node.fileName}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div
                  className={cn(
                    "absolute inset-0 opacity-0 grid place-items-center",
                    "pointer-events-none touch-none",
                    isFetching && "opacity-100",
                  )}
                >
                  <Loader2 className="size-10 text-muted-foreground animate-spin" />
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  handle.close();
                }}
              >
                Close
              </Button>

              <Button
                disabled={isFetching || isError}
                onClick={() => confirm(selectedPath)}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}
