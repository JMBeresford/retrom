import { Button } from "@retrom/ui-next/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui-next/components/dialog";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useModalAction } from "./use-modal-action";
import type { ReactNode } from "react";
import type { BaseModalActionProps } from "./modals";

declare global {
  namespace RetromModals {
    interface ModalActions {
      confirmModal: BaseModalActionProps & {
        title?: string;
        description?: string;
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
      } else if (modalAction.modalState?.onCancel) {
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
      <DialogContent className="sm:min-w-100">
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
          <DialogClose render={<Button variant="secondary">Cancel</Button>} />

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
