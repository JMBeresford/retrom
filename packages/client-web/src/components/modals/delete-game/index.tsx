import { useToast } from "@retrom/ui/hooks/use-toast";
import { getFileStub } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useDeleteGames } from "@/mutations/useDeleteGames";
import { useGameDetail } from "@/providers/game-details";
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

declare global {
  namespace RetromModals {
    interface ModalActions {
      deleteGameModal: BaseModalActionProps;
    }
  }
}

export function DeleteGameModal() {
  const { game, gameMetadata: metadata } = useGameDetail();
  const { toast } = useToast();
  const name = metadata?.name || getFileStub(game.path);
  const [deleteFromDisk, setDeleteFromDisk] = useState(false);
  const [blacklistEntries, setBlacklistEntries] = useState(false);
  const modalAction = useModalAction("deleteGameModal");
  const { openModal: confirm } = useModalAction("confirmModal");

  const { mutateAsync: deleteGame, isPending } = useDeleteGames();

  const handleDelete = useCallback(async () => {
    try {
      const res = await deleteGame({
        ids: [game.id],
        deleteFromDisk,
        blacklistEntries,
      });

      if (!res.gamesDeleted.length) {
        throw new Error("Failed to delete game");
      }
    } catch {
      toast({
        title: "Failed to delete game",
      });
    }
  }, [deleteGame, game.id, deleteFromDisk, blacklistEntries, toast]);

  const confirmDelete = useCallback(() => {
    confirm({
      onConfirm: async () => {
        await handleDelete();
        modalAction.closeModal();
      },
    });
  }, [confirm, handleDelete, modalAction]);

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
      <DialogContent className="max-w-[60ch]">
        <DialogHeader>
          <DialogTitle>Delete Game</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {name}?
          </DialogDescription>
        </DialogHeader>

        <p className="pb-2">
          You can either delete the entry from the database or delete the game
          from the disk.
          <br />
          <br />
          Deleting only the entry will leave your file system as is, but Retrom
          will re-create the entry on the next library scan unless you also
          blacklist it.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-top gap-2">
            <Checkbox
              id="delete-from-disk"
              checked={deleteFromDisk}
              disabled={game.thirdParty}
              onCheckedChange={(event) => setDeleteFromDisk(!!event)}
            />

            <div
              className={cn(
                "grid gap-1 5 leading-none",
                game.thirdParty && "opacity-50",
              )}
            >
              <label htmlFor="delete-from-disk">Delete from disk</label>

              <p className="text-sm text-muted-foreground">
                This will alter the the file system
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
              <label htmlFor="blacklist-entries">Blacklist entries</label>

              <p className="text-sm text-muted-foreground max-w-[45ch]">
                Enabling this will prevent the game and its files from being
                re-imported in any future library scans
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            variant="destructive"
            onClick={confirmDelete}
          >
            <LoaderCircleIcon
              className={cn("animate-spin absolute", !isPending && "opacity-0")}
            />
            <p className={cn(isPending && "opacity-0")}>Delete</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
