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

declare global {
  namespace RetromModals {
    export interface ModalActions {
      confirmModal?: {
        title: string;
        description: string;
        onClose: () => void;
      };
    }
  }
}

export function ConfirmModal() {
  const modalAction = useModalAction();
  const { confirmModal } = RootRoute.useSearch();
  const navigate = RootRoute.useNavigate();

  const close = useCallback(
    (confirmed: boolean = false) => {
      if (confirmed && modalAction.activeModalProps?.onClose) {
        modalAction.activeModalProps.onClose();
      }

      return navigate({
        search: (prev) => ({ ...prev, confirmModal: undefined }),
      });
    },
    [navigate, modalAction],
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
            onClick={() => {
              void close(true);
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
