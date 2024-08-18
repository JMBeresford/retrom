"use client";

import { useState } from "react";
import { MenubarItem } from "@/components/ui/menubar";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRetromClient } from "@/providers/retrom-client";
import { redirect } from "next/navigation";

export function DeleteLibraryMenuItem() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const { mutate, isPending } = useMutation({
    onError: (err) => {
      toast({
        title: "Error deleting library",
        variant: "destructive",
        description: err.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["platforms"] });
      queryClient.invalidateQueries({ queryKey: ["metadata"] });

      toast({
        title: "Library deleted!",
        description: "Library has been deleted successfully.",
      });

      redirect("/");
    },
    mutationFn: async () => await retromClient.libraryClient.deleteLibrary({}),
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <MenubarItem
          className="text-destructive-text"
          onSelect={(e) => e.preventDefault()}
        >
          Delete Library
        </MenubarItem>
      </DialogTrigger>

      <DialogContent>
        Are you sure you want to delete the library?
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            variant="destructive"
            onClick={() => {
              mutate();
              setDialogOpen(false);
            }}
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
