import { Button } from "@retrom/ui-next/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui-next/components/dialog";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { registerModalHandle } from "./use-modal-action";
import type { ReactNode } from "react";
import type { BaseModalActionProps } from "./modals";

export type ConfirmModalProps = BaseModalActionProps & {
  content?: ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
};

declare global {
  namespace RetromModals {
    interface ModalActions {
      confirm: ConfirmModalProps;
    }
  }
}

const handle = Dialog.createHandle<ConfirmModalProps>();
registerModalHandle("confirm", handle);

export function ConfirmDialog() {
  return (
    <Dialog handle={handle}>
      {function Render({ payload }) {
        const { mutate: close, status } = useMutation({
          mutationFn: async (confirmed: boolean) => {
            if (confirmed && payload?.onConfirm) {
              await payload.onConfirm();
            } else if (payload?.onCancel) {
              await payload.onCancel();
            }
          },
          onSuccess: () => {
            handle.close();
          },
        });

        return (
          <DialogContent className="sm:min-w-100">
            <DialogHeader>
              <DialogTitle>{payload?.title ?? "Are you sure?"}</DialogTitle>
              <DialogDescription
                render={
                  <span>
                    {payload?.description ?? "This action cannot be undone."}
                  </span>
                }
              ></DialogDescription>
            </DialogHeader>

            {payload?.content}

            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => close(false)}>
                Cancel
              </Button>

              <Button
                className="relative"
                variant="destructive"
                disabled={status === "pending"}
                onClick={() => {
                  close(true);
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
        );
      }}
    </Dialog>
  );
}
