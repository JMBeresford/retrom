import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Route as RootRoute } from "@/routes/__root";
import { ReactNode, useCallback } from "react";
import { useModalAction } from "@/providers/modal-action";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

declare global {
  namespace RetromModals {
    export interface ModalActions {
      confirmModal?: {
        title: string;
        description: string;
        content?: ReactNode;
        onConfirm: () => void | Promise<void>;
        onCancel?: () => void | Promise<void>;
      };
    }
  }
}

export function ConfirmModal() {
  const modalAction = useModalAction("confirmModal");
  const { confirmModal } = RootRoute.useSearch();
  const navigate = useNavigate();

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
      return navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          confirmModal: undefined,
        }),
      }).then(async () => {
        if (confirmed) {
          mutate();
        } else if (!confirmed && modalAction.modalState?.onCancel) {
          await modalAction.modalState.onCancel();
        }
      });
    },
    [navigate, modalAction, mutate],
  );

  return (
    <Dialog
      open={!!confirmModal?.open}
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
