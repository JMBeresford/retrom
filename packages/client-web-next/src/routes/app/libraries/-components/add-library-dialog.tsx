import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui-next/components/dialog";
import { Button } from "@retrom/ui-next/components/button";
import { ScrollArea } from "@retrom/ui-next/components/scroll-area";
import { LibraryForm } from "./form";
import type { BaseModalActionProps } from "@/modals/modals";
import { useModalAction } from "@/modals/use-modal-action";

export type AddLibraryDialogProps = BaseModalActionProps;

declare global {
  namespace RetromModals {
    interface ModalActions {
      addLibrary: AddLibraryDialogProps;
    }
  }
}

export function AddLibraryDialog() {
  const dialog = useModalAction("addLibrary");

  return (
    <Dialog
      open={!!dialog.modalState?.open}
      onOpenChange={(open) => {
        if (!open) {
          dialog.closeModal();
        }
      }}
    >
      <DialogContent className="flex flex-col max-h-[90dvh] justify-between overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Library</DialogTitle>
          <DialogDescription>
            Configure Retrom to track a new library.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex flex-col h-full overflow-y-auto [&>div>div]:scroll-fade-y">
          <LibraryForm />
        </ScrollArea>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
