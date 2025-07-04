import { Button } from "@/components/ui/button";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Route as RootRoute } from "@/routes/__root";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

export function ExitModal() {
  const navigate = useNavigate();
  const { exitModal } = RootRoute.useSearch();

  const close = useCallback(() => {
    navigate({
      search: (prev) => ({ ...prev, exitModal: undefined }),
    }).catch(console.error);
  }, [navigate]);

  return (
    <Dialog
      open={!!exitModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exit Retrom</DialogTitle>
        </DialogHeader>

        <p>
          Are you sure you want to exit Retrom? Any unsaved changes will be
          lost.
        </p>

        <DialogFooter>
          <DialogClose>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() =>
              void getCurrentWebviewWindow().close().catch(console.error)
            }
          >
            Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
