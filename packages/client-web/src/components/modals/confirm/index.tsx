import { Button } from "@retrom/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { ReactNode, useCallback } from "react";
import { BaseModalActionProps, useModalAction } from "@/providers/modal-action";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

declare global {
  namespace RetromModals {
    export interface ModalActions {
      confirmModal: BaseModalActionProps & {
        content?: ReactNode;
        onConfirm?: () => void | Promise<void>;
        onCancel?: () => void | Promise<void>;
      };
    }
  }
}

export function ConfirmModal() {
  const modalAction = useModalAction("confirmModal");

  const { mutate, status } = useMutation({
    mutationFn: async () => {
      const fn = modalAction.modalState?.onConfirm;

      if (fn) {
        await fn();
      }
    },
  });

  const close = useCallback(
    async (confirmed: boolean = false) => {
      if (confirmed) {
        mutate();
      } else if (!confirmed && modalAction.modalState?.onCancel) {
        await modalAction.modalState.onCancel();
      }

      modalAction.closeModal();
    },
    [modalAction, mutate],
  );

  return (
    <Dialog
      open={!!modalAction.modalState?.open}
      onOpenChange={(open) => {
        if (!open) {
          close().catch(console.error);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {modalAction.modalState?.title ?? "Are you sure?"}
          </DialogTitle>
          <DialogDescription>
            {modalAction.modalState?.description ??
              "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        {modalAction.modalState?.content}

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            variant="destructive"
            disabled={status === "pending"}
            onClick={() => {
              close(true).catch(console.error);
            }}
          >
            {status === "pending" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
