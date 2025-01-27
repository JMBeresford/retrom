import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateLibraryMetadata } from "@/mutations/useUpdateLibraryMetadata";
import { useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { useCallback } from "react";

export function DownloadMetadataModal() {
  const navigate = useNavigate();
  const { downloadMetadataModal } = RootRoute.useSearch();

  const { mutate, isPending } = useUpdateLibraryMetadata();

  const close = useCallback(() => {
    navigate({
      search: (prev) => ({ ...prev, downloadMetadataModal: undefined }),
    }).catch(console.error);
  }, [navigate]);

  return (
    <Dialog
      open={downloadMetadataModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Metadata</DialogTitle>
          <DialogDescription>
            Starts the metadata update process to populate missing metadata for
            all platforms and games.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            disabled={isPending}
            onClick={() => {
              mutate();
              close();
            }}
          >
            <LoaderCircleIcon
              className={cn("animate-spin absolute", !isPending && "opacity-0")}
            />
            <p className={cn(isPending && "opacity-0")}>Update</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
