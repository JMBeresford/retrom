import { cn } from "@retrom/ui/lib/utils";
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
import { Button } from "@retrom/ui/components/button";
import { LoaderCircleIcon } from "lucide-react";
import { BaseModalActionProps, useModalAction } from "@/providers/modal-action";
import { GameFile } from "@retrom/codegen/retrom/models/game-files_pb";
import { useUpdateGameFiles } from "@/mutations/useUpdateGameFiles";
import { getFileName } from "@/lib/utils";
import { toast } from "@retrom/ui/components/toast";
import { Input } from "@retrom/ui/components/input";

declare global {
  namespace RetromModals {
    interface ModalActions {
      renameFileModal: BaseModalActionProps & {
        file: GameFile;
      };
    }
  }
}

export function RenameFileModal() {
  const modalAction = useModalAction("renameFileModal");
  const [renameValue, setRenameValue] = useState(
    getFileName(modalAction.modalState?.file.path),
  );

  const { mutateAsync: updateGameFiles, isPending } = useUpdateGameFiles();

  const handleRename = useCallback(async () => {
    const file = modalAction.modalState?.file;

    try {
      if (file === undefined) {
        throw new Error("No file provided");
      }

      const fileId = file.id;
      const currentPath = file.path;

      const newPath = currentPath.replace(
        getFileName(currentPath),
        renameValue,
      );

      const res = await updateGameFiles({
        gameFiles: [{ id: fileId, path: newPath }],
      });

      if (!res.gameFilesUpdated.length) {
        throw new Error("Failed to update file");
      }

      toast({
        title: "File updated",
        description: "The file has been renamed",
      });
    } catch {
      toast({
        title: "Failed to update file",
        description:
          "An error occurred while updating the file, please try again.",
        variant: "destructive",
      });
    }
  }, [modalAction, renameValue, updateGameFiles]);

  return (
    <Dialog
      open={!!modalAction.modalState?.open}
      onOpenChange={(open) => {
        if (open) {
          modalAction.modalState?.onOpen?.();
        } else {
          modalAction.modalState?.onClose?.();
          modalAction.closeModal();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Game File</DialogTitle>
          <DialogDescription>
            Change the name of the file on both Retrom and the file system
          </DialogDescription>
        </DialogHeader>

        <Input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
        />

        <DialogFooter>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button disabled={isPending} variant="secondary">
                Cancel
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button onClick={handleRename} disabled={isPending}>
                <LoaderCircleIcon
                  className={cn("animate-spin", !isPending && "hidden")}
                />
                Save
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
