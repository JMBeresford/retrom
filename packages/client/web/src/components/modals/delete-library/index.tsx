import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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

        <div className="flex justify-end gap-2 mt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
