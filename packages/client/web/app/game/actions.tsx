"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateMetadataDialog } from "@/components/update-metadata-dialog";
import { cn, getFileName } from "@/lib/utils";
import { EllipsisVertical, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useGameDetail } from "./game-context";
import { REST_HOST } from "@/lib/env";
import { useMutation } from "@tanstack/react-query";

type Modal = (typeof Modal)[number];
const Modal = ["edit", "delete"] as const;

export function Actions() {
  const [activeModal, setActiveModal] = useState<Modal | null>(null);
  const { game } = useGameDetail();

  return (
    <Dialog>
      <div className="flex gap-2">
        <form action={`${REST_HOST}/game/${game.id}`} className="w-full">
          <Button className="w-full" type="submit">
            Download
          </Button>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setActiveModal("edit")} asChild>
              <DialogTrigger className="w-full cursor-pointer">
                Edit
              </DialogTrigger>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => setActiveModal("delete")} asChild>
              <DialogTrigger className="w-full cursor-pointer text-red-500">
                Delete
              </DialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {activeModal === "edit" && <UpdateMetadataDialog />}
      {activeModal === "delete" && <DeleteGameModal />}
    </Dialog>
  );
}

function DeleteGameModal() {
  const { game, gameMetadata: metadata } = useGameDetail();
  const name = metadata?.name || getFileName(game.path);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // await retromClient.gameClient.deleteGame(game.id);
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Game</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {name}?
        </DialogDescription>
      </DialogHeader>

      <p>This will not delete the game from your filesystem.</p>

      <DialogFooter>
        <DialogClose asChild>
          <Button>Cancel</Button>
        </DialogClose>

        <Button
          className="relative"
          variant="destructive"
          onClick={() => {
            mutate();
          }}
        >
          <LoaderIcon
            className={cn("animate-spin absolute", !isPending && "opacity-0")}
          />
          <p className={cn(isPending && "opacity-0")}>Delete</p>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
