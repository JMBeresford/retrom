"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
  const [loading, setLoading] = useState(false);
  const { game, metadata } = useGameDetail();

  const name = metadata?.name || getFileName(game.path);

  return (
    <DialogContent>
      Are you sure you want to delete {name}?
      <div className="flex justify-end gap-2 mt-4">
        <DialogClose asChild>
          <Button>Cancel</Button>
        </DialogClose>

        <Button className="relative" variant="destructive" onClick={() => {}}>
          <LoaderIcon
            className={cn("animate-spin absolute", !loading && "opacity-0")}
          />
          <p className={cn(loading && "opacity-0")}>Delete</p>
        </Button>
      </div>
    </DialogContent>
  );
}
