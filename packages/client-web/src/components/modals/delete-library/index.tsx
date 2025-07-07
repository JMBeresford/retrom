import { useToast } from "@retrom/ui/hooks/use-toast";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRetromClient } from "@/providers/retrom-client";
import { useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";

export function DeleteLibraryModal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const navigate = useNavigate();
  const { deleteLibraryModal } = RootRoute.useSearch();

  const { mutate, isPending } = useMutation({
    onError: (err) => {
      toast({
        title: "Error deleting library",
        variant: "destructive",
        description: err.message,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          ["library", "games", "platforms", "metadata"].some((key) =>
            queryKey.includes(key),
          ),
      });

      toast({
        title: "Library deleted!",
        description: "Library has been deleted successfully.",
      });

      return navigate({
        to: "/",
        search: (prev) => ({ ...prev, deleteLibraryModal: undefined }),
      });
    },
    mutationFn: async () => await retromClient.libraryClient.deleteLibrary({}),
  });

  return (
    <Dialog
      open={deleteLibraryModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            to: ".",
            search: (prev) => ({ ...prev, deleteLibraryModal: undefined }),
          });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Library</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your library?
          </DialogDescription>
        </DialogHeader>

        <p className="max-w-[45ch]">
          This will not remove any files or directories from your file-system.
          Running a library scan again will re-create the library and all
          entries.
        </p>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            variant="destructive"
            onClick={() => mutate()}
          >
            <LoaderCircleIcon
              className={cn("animate-spin absolute", !isPending && "opacity-0")}
            />
            <p className={cn(isPending && "opacity-0")}>Delete</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
