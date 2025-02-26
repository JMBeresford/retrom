import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Route as RootRoute } from "@/routes/__root";
import { useCallback } from "react";
import { useModalAction } from "@/providers/modal-action";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

declare global {
  namespace RetromModals {
    export interface ModalActions {
      confirmModal?: {
        title: string;
        description: string;
        onConfirm: () => void | Promise<void>;
        onCancel?: () => void | Promise<void>;
      };
    }
  }
}

export function ConfirmModal() {
  const modalAction = useModalAction("confirmModal");
  const { confirmModal } = RootRoute.useSearch();
  const navigate = RootRoute.useNavigate();

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

      return navigate({
        search: (prev) => ({ ...prev, confirmModal: undefined }),
      });
    },
    [navigate, modalAction, mutate],
  );

  return (
    <Dialog
      open={confirmModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void close();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmModal?.title ?? "Are you sure?"}</DialogTitle>
          <DialogDescription>
            {confirmModal?.description ?? "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            variant="destructive"
            disabled={status === "pending"}
            onClick={() => {
              void close(true);
            }}
          >
            {status === "pending" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
