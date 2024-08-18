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
import { useUpdateLibrary } from "@/mutations/useUpdateLibrary";

export function UpdateLibraryMenuItem() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate, isPending } = useUpdateLibrary();

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
            Starts the update process to populate platforms and games that have
            been added to the filesystem since the last update.
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
