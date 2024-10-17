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
import { useUpdateLibrary } from "@/mutations/useUpdateLibrary";
import { useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { useCallback } from "react";

export function UpdateLibraryModal() {
  const navigate = useNavigate();
  const { updateLibraryModal } = RootRoute.useSearch();

  const { mutate: updateLibrary, isPending } = useUpdateLibrary();

  const close = useCallback(
    () =>
      navigate({
        search: { updateLibraryModal: undefined },
      }),
    [navigate],
  );

  return (
    <Dialog
      open={updateLibraryModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Library</DialogTitle>
          <DialogDescription className="max-w-[65ch]">
            Starts the update process to populate platforms and games that have
            been added to the service&apos;s filesystem since the last update.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            onClick={() => {
              updateLibrary();
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
