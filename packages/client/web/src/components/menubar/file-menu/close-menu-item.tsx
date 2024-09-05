import { Button } from "@/components/ui/button";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MenubarItem } from "@/components/ui/menubar";

export function CloseMenuItem() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <MenubarItem
          className="text-destructive-text"
          onSelect={(e) => e.preventDefault()}
        >
          Close
        </MenubarItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Retrom</DialogTitle>
        </DialogHeader>

        <p>
          Are you sure you want to close Retrom? Any unsaved changes will be
          lost.
        </p>

        <DialogFooter>
          <Button variant="secondary">Cancel</Button>
          <Button
            variant="destructive"
            onClick={() =>
              getCurrentWebviewWindow().close().catch(console.error)
            }
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
