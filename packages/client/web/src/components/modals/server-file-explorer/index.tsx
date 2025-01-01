import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fragment, ReactElement, useCallback, useMemo, useState } from "react";
import { Route as RootRoute } from "@/routes/__root";
import { useServerFilesystem } from "@/queries/useServerFilesystem";
import { GetFilesystemNodeRequest } from "@/generated/retrom/services";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilesystemNodeType } from "@/generated/retrom/file-explorer";
import { FileIcon, FolderIcon, LucideProps, Slash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModalAction } from "@/providers/modal-action";

declare global {
  namespace RetromModals {
    export interface ModalActions {
      serverFileExplorerModal?: {
        title: string;
        description: string;
        onClose: (path: string | undefined) => void;
      };
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
  [FilesystemNodeType.UNRECOGNIZED]: () => <></>,
};

export function ServerFileExplorerModal() {
  const [path, setPath] = useState<string | undefined>();
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const modalAction = useModalAction();
  const { serverFileExplorerModal } = RootRoute.useSearch();
  const navigate = RootRoute.useNavigate();

  const request: GetFilesystemNodeRequest = useMemo(() => ({ path }), [path]);
  const { data, status } = useServerFilesystem({ request });

  const pending = status === "pending";
  const error = status === "error";

  const pathParts = data?.node?.path.split("/").filter(Boolean) ?? [];

  const close = useCallback(
    (path?: string) => {
      const action = modalAction?.activeModalProps?.onClose;
      if (action) {
        action(path);
      }

      navigate({
        search: (prev) => ({ ...prev, serverFileExplorerModal: undefined }),
      });
    },
    [modalAction?.activeModalProps, navigate],
  );

  return (
    <Dialog
      open={serverFileExplorerModal?.open}
      onOpenChange={(value) => {
        if (!value) {
          close();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {serverFileExplorerModal?.title || <>Server Files</>}
          </DialogTitle>
          <DialogDescription className="max-w-[65ch]">
            {serverFileExplorerModal?.description || (
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
                    <Breadcrumb className="bg-muted py-2 px-4 border-b">
                      <BreadcrumbList>
                        <BreadcrumbItem
                          onClick={() => setPath(`/${pathParts.at(0)}`)}
                          className={cn(
                            pathParts.length === 1 && "text-foreground",
                            "cursor-pointer hover:text-foreground transition-colors",
                          )}
                        >
                          {pathParts.at(0)}
                        </BreadcrumbItem>

                        {pathParts.length > 4 && (
                          <>
                            <BreadcrumbSeparator>
                              <Slash />
                            </BreadcrumbSeparator>
                            <BreadcrumbEllipsis className="h-min" />
                          </>
                        )}

                        {pathParts
                          .slice(pathParts.length > 4 ? -3 : 1)
                          .map((part, index, parts) => {
                            const indexFromEnd =
                              (pathParts.length > 4
                                ? 3
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
                      onDoubleClick={() => setPath(child.path)}
                      className={cn(
                        "cursor-pointer *:py-2 border-b last:border-b-0 first:border-t-0",
                        selectedPath === child.path &&
                          "bg-accent/30 hover:bg-accent/30",
                      )}
                    >
                      <TableCell>
                        <Icon size={"1rem"} className={cn("")} />
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
