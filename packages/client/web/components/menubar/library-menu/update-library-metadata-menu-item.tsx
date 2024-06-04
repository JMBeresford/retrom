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
import { UpdateLibraryMetadataResponse } from "@/generated/retrom/services";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function UpdateMetadataMenuItem() {
  const { toast } = useToast();
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    onError: (err) => {
      toast({
        title: "Error updating library metadata",
        variant: "destructive",
        description: err.message,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["game-metadata"] });
      queryClient.invalidateQueries({ queryKey: ["platform-metadata"] });

      toast({
        title: "Library metadata updated!",
        description: updateMetadataSuccessMessage(res),
      });
    },
    mutationFn: async () =>
      await retromClient.libraryClient.updateLibraryMetadata(),
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          Update Library Metadata
        </MenubarItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Library Metadata</DialogTitle>
          <DialogDescription>
            Starts the metadata update process to populate missing metadata for
            games.
          </DialogDescription>
        </DialogHeader>

        <p></p>

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

function updateMetadataSuccessMessage(response: UpdateLibraryMetadataResponse) {
  const gameMetadata = response.gameMetadataPopulated.length;
  const platformMetadata = response.platformMetadataPopulated.length;

  return `Updated: ${gameMetadata} game metadata entries, ${platformMetadata} platform metadata entries`;
}
