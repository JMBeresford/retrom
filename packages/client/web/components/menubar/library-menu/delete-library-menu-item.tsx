"use client";

import { useCallback, useState } from "react";
import { MenubarItem } from "@/components/ui/menubar";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { DeleteLibraryResponse } from "@/generated/retrom";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  handler: () => Promise<DeleteLibraryResponse>;
};

export function DeleteLibraryMenuItem(props: Props) {
  const handler = props.handler;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLibraryDelete = useCallback(() => {
    setLoading(true);
    handler()
      .then(() => {
        toast({
          title: "Library deleted!",
          description: "Library has been deleted successfully.",
        });
      })
      .catch((err) => {
        toast({
          title: "Error deleting library",
          variant: "destructive",
          description: err.message,
        });
      })
      .finally(() => {
        setLoading(false);
        setDialogOpen(false);
      });
  }, [handler, toast]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <MenubarItem
          className="text-red-500"
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
            onClick={() => handleLibraryDelete()}
          >
            <LoaderIcon
              className={cn("animate-spin absolute", !loading && "opacity-0")}
            />
            <p className={cn(loading && "opacity-0")}>Delete</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
