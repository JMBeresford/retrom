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
import { EllipsisVertical, LoaderCircleIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useUninstallGame } from "@/mutations/useUninstallGame";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { ActionButton } from "../../../../components/action-button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDeleteGames } from "@/mutations/useDeleteGames";
import { useToast } from "@/components/ui/use-toast";
import { useGameDetail } from "@/providers/game-details";

type Modal = (typeof Modal)[number];
const Modal = ["edit", "delete", "uninstall"] as const;

export function Actions() {
  const { game } = useGameDetail();
  const [activeModal, setActiveModal] = useState<Modal | null>(null);
  const { data: installationState } = useInstallationQuery(game);

  return (
    <Dialog>
      <div className="flex">
        <div
          className={cn(
            "w-full *:w-full rounded-bl-lg overflow-hidden border-r-2",
            installationState === InstallationStatus.INSTALLING && "bg-primary",
          )}
        >
          <ActionButton
            game={game}
            className='[&_div[role="progressbar"]]:w-[85%] [&_div[role="progressbar"]_>_*]:bg-primary-foreground'
          />
        </div>

        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="rounded-none rounded-br-lg overflow-hidden ring-inset"
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
          files from your filesystem. You will need to re-install the game to
          play it again.
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
          <LoaderCircleIcon
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
  const { toast } = useToast();
  const name = metadata?.name || getFileStub(game.path);
  const [deleteFromDisk, setDeleteFromDisk] = useState(false);

  const { mutateAsync: deleteGame, isPending } = useDeleteGames();

  const handleDelete = useCallback(async () => {
    try {
      const res = await deleteGame({ ids: [game.id], deleteFromDisk });

      if (!res.gamesDeleted.length) {
        throw new Error("Failed to delete game");
      }
    } catch {
      toast({
        title: "Failed to delete game",
      });
    }
  }, [deleteGame, game.id, deleteFromDisk, toast]);

  return (
    <DialogContent className="max-w-[60ch]">
      <DialogHeader>
        <DialogTitle>Delete Game</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {name}?
        </DialogDescription>
      </DialogHeader>

      <p className="pb-2">
        You can either delete the entry from the database or delete the game
        from the disk. Deleting only the entry will leave your file system as
        is, but Retrom will ignore the game&apos;s directory moving forward.
      </p>

      <DialogFooter>
        <div className="flex items-center justify-between gap-6 w-full">
          <div className="flex items-top gap-2">
            <Checkbox
              id="delete-from-disk"
              checked={deleteFromDisk}
              onCheckedChange={(event) => setDeleteFromDisk(!!event)}
            />

            <div className="grid gap-1 5 leading-none">
              <label htmlFor="delete-from-disk">Delete from disk</label>

              <p className="text-sm text-muted-foreground">
                This will alter the the file system
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>

            <Button
              className="relative"
              variant="destructive"
              onClick={handleDelete}
            >
              <LoaderCircleIcon
                className={cn(
                  "animate-spin absolute",
                  !isPending && "opacity-0",
                )}
              />
              <p className={cn(isPending && "opacity-0")}>Delete</p>
            </Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
