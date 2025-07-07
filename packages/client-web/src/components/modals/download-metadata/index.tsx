import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { Button } from "@retrom/ui/components/button";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@retrom/ui/lib/utils";
import { useUpdateLibraryMetadata } from "@/mutations/useUpdateLibraryMetadata";
import { useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { useCallback, useState } from "react";
import { Checkbox } from "@retrom/ui/components/checkbox";

export function DownloadMetadataModal() {
  const navigate = useNavigate();
  const [overwrite, setOverwrite] = useState(false);
  const { downloadMetadataModal } = RootRoute.useSearch();

  const { mutate, isPending } = useUpdateLibraryMetadata();

  const close = useCallback(() => {
    navigate({
      to: ".",
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

        <div className="flex items-top gap-2">
          <Checkbox
            id="overwrite"
            checked={overwrite}
            onCheckedChange={(event) => setOverwrite(!!event)}
          />

          <div className={cn("grid gap-1 5 leading-none")}>
            <label htmlFor="delete-from-disk">
              Overwrite existing metadata
            </label>

            <p className="text-sm text-muted-foreground max-w-[60ch]">
              This will update existing metadata with the latest data. Leaving
              this unchecked will skip entries that already have metadata.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            disabled={isPending}
            onClick={() => {
              mutate({ overwrite });
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
