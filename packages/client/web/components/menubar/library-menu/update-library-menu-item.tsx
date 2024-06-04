"use client";

import { useState } from "react";
import { MenubarItem } from "@/components/ui/menubar";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { UpdateLibraryResponse } from "@/generated/retrom/services";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function UpdateLibraryMenuItem() {
  const { toast } = useToast();
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    onError: (err) => {
      toast({
        title: "Error updating library",
        variant: "destructive",
        description: err.message,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["platforms"] });

      toast({
        title: "Library updated!",
        description: updateLibrarySuccessMessage(res),
      });
    },
    mutationFn: async () => await retromClient.libraryClient.updateLibrary(),
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          Update Library
        </MenubarItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Library</DialogTitle>
          <DialogDescription>
            Starts the update process to populate missing data for platforms,
            games and game files.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            onClick={() => {
              mutate();
              setDialogOpen(false);
            }}
          >
            <LoaderIcon
              className={cn("animate-spin absolute", !isPending && "opacity-0")}
            />
            <p className={cn(isPending && "opacity-0")}>Update</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function updateLibrarySuccessMessage(response: UpdateLibraryResponse) {
  return `Updated: ${response.platformsPopulated.length} platforms, ${response.gamesPopulated.length} games and ${response.gameFilesPopulated.length} game files`;
}
