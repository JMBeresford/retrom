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
import { UpdateLibraryResponse } from "@/generated/retrom";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  handler: () => Promise<UpdateLibraryResponse>;
};

export function UpdateLibraryMenuItem(props: Props) {
  const handler = props.handler;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLibraryUpdate = useCallback(() => {
    setLoading(true);
    handler()
      .then((res) =>
        toast({
          title: "Library updated!",
          description: updateLibrarySuccessMessage(res),
        }),
      )
      .catch((err) =>
        toast({
          title: "Error updating library",
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
          Update Library
        </MenubarItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Library</DialogTitle>
        </DialogHeader>

        <p>
          Start the update process to populate missing data for platforms, games
          and game files. Force update will overwrite existing data in addition
          to populating missing data.
        </p>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button className="relative" onClick={() => handleLibraryUpdate()}>
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

function updateLibrarySuccessMessage(response: UpdateLibraryResponse) {
  return `Updated: ${response.platformsPopulated.length} platforms, ${response.gamesPopulated.length} games and ${response.gameFilesPopulated.length} game files`;
}
