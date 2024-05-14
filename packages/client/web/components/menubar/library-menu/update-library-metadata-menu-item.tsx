"use client";

import { useCallback, useState } from "react";
import { MenubarItem } from "@/components/ui/menubar";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { UpdateLibraryMetadataResponse } from "@/generated/retrom";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  handler: () => Promise<UpdateLibraryMetadataResponse>;
};

export function UpdateMetadataMenuItem(props: Props) {
  const handler = props.handler;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLibraryMetadataUpdate = useCallback(() => {
    setLoading(true);
    handler()
      .then((res) =>
        toast({
          title: "Library metadata updated!",
          description: updateMetadataSuccessMessage(res),
        }),
      )
      .catch((err) =>
        toast({
          title: "Error updating library metadata",
          variant: "destructive",
          description: err.message,
        }),
      )
      .finally(() => {
        setLoading(false);
        setDialogOpen(false);
      });
  }, [handler, toast]);

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
        </DialogHeader>

        <p>
          Run the metadata update process to populate missing metadata for
          games. Force update will overwrite existing metadata in addition to
          populating missing metadata.
        </p>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            onClick={() => handleLibraryMetadataUpdate()}
          >
            <LoaderIcon
              className={cn("animate-spin absolute", !loading && "opacity-0")}
            />
            <p className={cn(loading && "opacity-0")}>Update</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function updateMetadataSuccessMessage(response: UpdateLibraryMetadataResponse) {
  return `Updated: ${response.metadataPopulated.length} metadata entries`;
}
