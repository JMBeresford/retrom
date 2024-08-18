"use client";

import { useState } from "react";
import { MenubarItem } from "@/components/ui/menubar";
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
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateLibraryMetadata } from "@/mutations/useUpdateLibraryMetadata";

export function UpdateMetadataMenuItem() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate, isPending } = useUpdateLibraryMetadata();

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
            platforms and games.
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
