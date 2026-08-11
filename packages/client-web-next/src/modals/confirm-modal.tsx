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
    <Dialog
      handle={handle}
      onOpenChange={(open) => {
        console.log("ConfirmDialog onOpenChange", { open });
      }}
    >
      {function Render({ payload }) {
        const { mutate, status } = useMutation({
          mutationFn: async () => {
            const fn = payload?.onConfirm;

            if (fn) {
              await fn();
            }
          },
        });

        const close = useCallback(
          async (confirmed: boolean = false) => {
            if (confirmed) {
              mutate();
            } else if (payload?.onCancel) {
              await payload.onCancel();
            }
          },
          [payload, mutate],
        );

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
              <DialogClose
                render={<Button variant="secondary">Cancel</Button>}
              />

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
        );
      }}
    </Dialog>
  );
}
