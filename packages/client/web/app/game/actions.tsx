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
import { cn, getFileStub } from "@/lib/utils";
import { EllipsisVertical, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useGameDetail } from "./game-context";
import { IS_DESKTOP, REST_HOST } from "@/lib/env";
import { useMutation } from "@tanstack/react-query";
import { InstallGameButton } from "@/app/game/install-game-button";
import { useUninstallGame } from "@/mutations/useUninstallGame";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { InstallationStatus } from "@/generated/retrom/client-utils";
import { PlayGameButton } from "./play-game-button";

type Modal = (typeof Modal)[number];
const Modal = ["edit", "delete", "uninstall"] as const;

export function Actions() {
  const { game } = useGameDetail();
  const [activeModal, setActiveModal] = useState<Modal | null>(null);
  const { data: installationState } = useInstallationQuery(game);

  return (
    <Dialog>
      <div className="flex">
        <div className="w-full *:w-full rounded-bl-lg overflow-hidden border-r-2">
          {IS_DESKTOP ? (
            installationState === InstallationStatus.INSTALLED ? (
              <PlayGameButton />
            ) : (
              <InstallGameButton />
            )
          ) : (
            <form action={`${REST_HOST}/game/${game.id}`} className="w-full">
              <Button type="submit" className="w-full">
                Download
              </Button>
            </form>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="rounded-none rounded-br-lg overflow-hidden"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setActiveModal("edit")} asChild>
              <DialogTrigger className="w-full cursor-pointer">
                Edit
              </DialogTrigger>
            </DropdownMenuItem>

            {installationState === InstallationStatus.INSTALLED && (
              <DropdownMenuItem
                onSelect={() => setActiveModal("uninstall")}
                asChild
              >
                <DialogTrigger className="w-full cursor-pointer">
                  Uninstall
                </DialogTrigger>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onSelect={() => setActiveModal("delete")} asChild>
              <DialogTrigger className="w-full cursor-pointer text-destructive-text">
                Delete
              </DialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {activeModal === "edit" && (
        <UpdateMetadataDialog className="min-w-[35vw]" />
      )}
      {activeModal === "uninstall" && <UninstallGameModal />}
      {activeModal === "delete" && <DeleteGameModal />}
    </Dialog>
  );
}

function UninstallGameModal() {
  const { game, gameMetadata: metadata } = useGameDetail();
  const name = metadata?.name || getFileStub(game.path);
  const { data: installationState } = useInstallationQuery(game);

  const { mutate: uninstall, isPending } = useUninstallGame(game);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Uninstall Game</DialogTitle>
        <DialogDescription className="w-[60ch]">
          Are you sure you want to uninstall {name}? This will remove the game
          files from your filesystem.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose asChild>
          <Button>Cancel</Button>
        </DialogClose>

        <Button
          disabled={
            isPending || installationState !== InstallationStatus.INSTALLED
          }
          className="relative"
          variant="destructive"
          onClick={() => {
            uninstall();
          }}
        >
          <LoaderIcon
            className={cn("animate-spin absolute", !isPending && "opacity-0")}
          />
          <p className={cn(isPending && "opacity-0")}>Uninstall</p>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function DeleteGameModal() {
  const { game, gameMetadata: metadata } = useGameDetail();
  const name = metadata?.name || getFileStub(game.path);

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

      <p>
        This will remove the game from the database. This will{" "}
        <strong>not</strong> delete the game from your filesystem.
      </p>

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
