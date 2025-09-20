import { toast } from "@retrom/ui/hooks/use-toast";
import { useCallback, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@retrom/ui/components/dialog";
import { Checkbox } from "@retrom/ui/components/checkbox";
import { Button } from "@retrom/ui/components/button";
import { LoaderCircleIcon } from "lucide-react";
import { BaseModalActionProps, useModalAction } from "@/providers/modal-action";
import { useDeleteGameFiles } from "@/mutations/useDeleteGameFile";
import { cn } from "@retrom/ui/lib/utils";

declare global {
  namespace RetromModals {
    interface ModalActions {
      deleteFileModal: BaseModalActionProps & {
        fileId: number;
      };
    }
  }
}

export function DeleteFileModal() {
  const [deleteFromDisk, setDeleteFromDisk] = useState(false);
  const [blacklistEntries, setBlacklistEntries] = useState(false);
  const modalAction = useModalAction("deleteFileModal");
  const { openModal: confirm } = useModalAction("confirmModal");

  const { mutateAsync: deleteGameFiles, status: deletionStatus } =
    useDeleteGameFiles();

  const handleDelete = useCallback(async () => {
    const fileId = modalAction.modalState?.fileId;
    if (fileId === undefined) {
      throw new Error("No file ID provided");
    }

    try {
      const res = await deleteGameFiles({
        ids: [fileId],
        deleteFromDisk,
        blacklistEntries,
      });

      if (!res.gameFilesDeleted.length) {
        throw new Error("Failed to delete game");
      }
    } catch (e) {
      console.error(e);

      toast({
        title: "Failed to delete game",
      });
    }
  }, [deleteGameFiles, modalAction, deleteFromDisk, blacklistEntries]);

  const confirmDelete = useCallback(() => {
    confirm({
      onConfirm: async () => {
        await handleDelete();
        modalAction.closeModal();
      },
    });
  }, [confirm, handleDelete, modalAction]);

  const pending = deletionStatus === "pending";

  return (
    <Dialog
      open={!!modalAction.modalState?.open}
      onOpenChange={(open) => {
        if (open) {
          modalAction.modalState?.onOpen?.();
        } else {
          modalAction.modalState?.onClose?.();
          modalAction.closeModal();
          setDeleteFromDisk(false);
          setBlacklistEntries(false);
        }
      }}
    >
      <DialogContent className="max-w-[65ch]">
        <DialogHeader>
          <DialogTitle>Delete Game File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this file?
          </DialogDescription>
        </DialogHeader>

        <p className="pb-2">
          You can either delete the entry from the database or delete the file
          from the disk. Deleting only the entry will leave your file system as
          is, but Retrom will ignore the file moving forward.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-top gap-2">
            <Checkbox
              id="delete-from-disk"
              checked={deleteFromDisk}
              onCheckedChange={(event) => setDeleteFromDisk(!!event)}
            />

            <div className="grid gap-1 5 leading-none">
              <label htmlFor="delete-from-disk">Delete from disk</label>

              <p className="text-sm text-muted-foreground">
                This will alter the file system
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Checkbox
              id="blacklist-entries"
              checked={blacklistEntries}
              onCheckedChange={(event) => setBlacklistEntries(!!event)}
            />

            <div className="grid gap-1 5 leading-none">
              <label htmlFor="blacklist-entries">Blacklist entry</label>

              <p className="text-sm text-muted-foreground max-w-[45ch]">
                Enabling this will prevent the file from being re-imported in
                any future library scans
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button disabled={pending}>Cancel</Button>
            </DialogClose>

            <Button
              onClick={confirmDelete}
              variant="destructive"
              disabled={pending}
            >
              <LoaderCircleIcon
                className={cn("animate-spin", !pending && "hidden")}
              />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
