import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { Fragment, ReactElement, useCallback, useMemo, useState } from "react";
import { useServerFilesystem } from "@/queries/useServerFilesystem";
import { GetFilesystemNodeRequest } from "@retrom/codegen/retrom/services/file-explorer-service_pb";
import { Button } from "@retrom/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@retrom/ui/components/table";
import { FilesystemNodeType } from "@retrom/codegen/retrom/file-explorer_pb";
import {
  FileIcon,
  FolderIcon,
  HardDriveIcon,
  LucideProps,
  Slash,
} from "lucide-react";
import { cn } from "@retrom/ui/lib/utils";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@retrom/ui/components/breadcrumb";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { BaseModalActionProps, useModalAction } from "@/providers/modal-action";
import { RawMessage } from "@/utils/protos";

declare global {
  namespace RetromModals {
    export interface ModalActions {
      serverFileExplorerModal: BaseModalActionProps<
        undefined,
        (path: string | undefined) => void
      >;
    }
  }
}

const FilesystemNodeIcon: Record<
  FilesystemNodeType,
  (props: LucideProps) => ReactElement
> = {
  [FilesystemNodeType.DIRECTORY]: ({ className, ...props }) => (
    <FolderIcon className={cn("fill-primary stroke-0", className)} {...props} />
  ),
  [FilesystemNodeType.FILE]: ({ className, ...props }) => (
    <FileIcon
      className={cn("fill-muted-foreground stroke-2 stroke-muted", className)}
      {...props}
    />
  ),
  [FilesystemNodeType.UNKNOWN]: () => <></>,
};

const MAX_CRUMBS = 3;

export function ServerFileExplorerModal() {
  const [path, setPath] = useState<string>("./");
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const modalAction = useModalAction("serverFileExplorerModal");
  const { modalState, closeModal } = modalAction;

  const request: RawMessage<GetFilesystemNodeRequest> = useMemo(
    () => ({ path }),
    [path],
  );

  const { data, status } = useServerFilesystem({ request });
  const pending = status === "pending";
  const error = status === "error";

  const pathParts = data?.node?.path.split("/").filter(Boolean) ?? [];

  const close = useCallback(
    (path?: string) => {
      const action = modalState?.onClose;
      if (action) {
        action(path);
      }

      if (!path) {
        setPath("./");
      }

      closeModal();
    },
    [modalState, closeModal],
  );

  return (
    <Dialog
      modal
      open={!!modalState?.open}
      onOpenChange={(value) => {
        if (!value) {
          close();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modalState?.title || <>Server Files</>}</DialogTitle>
          <DialogDescription className="max-w-[65ch]">
            {modalState?.description || (
              <>
                These are the files on the Retrom server. If you are using
                standalone mode, then these are also the files on your computer.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-fit rounded border relative">
          <div className="max-h-[400px] relative">
            <Table className="min-w-[400px]">
              <TableHeader className="[&_tr]:border-b-0 sticky top-0">
                <TableRow>
                  <TableHead colSpan={2} className="p-0 h-min">
                    <Breadcrumb className="bg-muted py-2 px-4 border-b select-none">
                      <BreadcrumbList>
                        <BreadcrumbItem onClick={() => setPath(`/`)}>
                          <HardDriveIcon
                            className={cn(
                              "w-[1.25rem] h-[1.25rem] stroke-muted-foreground",
                              pathParts.length === 0 && "stroke-foreground",
                              "cursor-pointer hover:stroke-foreground transition-colors",
                            )}
                          />
                        </BreadcrumbItem>

                        {pathParts.length ? (
                          <BreadcrumbSeparator>
                            <Slash />
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
                              <Slash />
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
                              "/" + pathParts.slice(0, -indexFromEnd).join("/");

                            return (
                              <Fragment key={index}>
                                <BreadcrumbSeparator>
                                  <Slash />
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
                {data?.children.map((child) => {
                  const Icon = FilesystemNodeIcon[child.nodeType];

                  return (
                    <TableRow
                      key={child.name}
                      onClick={() => setSelectedPath(child.path)}
                      onDoubleClick={() =>
                        child.nodeType === FilesystemNodeType.DIRECTORY
                          ? setPath(child.path)
                          : close(child.path)
                      }
                      className={cn(
                        "cursor-pointer *:py-2 border-b last:border-b-0 first:border-t-0",
                        selectedPath === child.path &&
                          "bg-accent/30 hover:bg-accent/30",
                      )}
                    >
                      <TableCell>
                        <Icon size={"1rem"} />
                      </TableCell>
                      <TableCell className="w-full select-none">
                        {child.name}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>

          <Button
            disabled={pending || error}
            onClick={() => close(selectedPath)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
