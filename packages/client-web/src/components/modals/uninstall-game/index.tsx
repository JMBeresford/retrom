import { Button } from "@retrom/ui/components/button";
import {
  DialogContent,
  DialogHeader,
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@retrom/ui/components/dialog";
import { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils_pb";
import { getFileStub } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useUninstallGame } from "@/mutations/useUninstallGame";
import { useGameDetail } from "@/providers/game-details";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { Route } from "@/routes/(windowed)/_layout/games/$gameId";

export function UninstallGameModal() {
  const { game, gameMetadata: metadata } = useGameDetail();
  const name = metadata?.name || getFileStub(game.path);
  const { data: installationState } = useInstallationQuery(game);
  const { uninstallGameModal } = Route.useSearch();
  const navigate = useNavigate();

  const { mutateAsync: uninstall, isPending } = useUninstallGame(game);

  return (
    <Dialog
      open={uninstallGameModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            to: ".",
            search: (prev) => ({ ...prev, uninstallGameModal: undefined }),
          });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uninstall Game</DialogTitle>
          <DialogDescription className="w-[60ch]">
            Are you sure you want to uninstall {name}?{" "}
          </DialogDescription>
        </DialogHeader>

        <p className="max-w-[45ch]">
          This will remove the game files from your local filesystem. You will
          need to re-install the game to play it again.
        </p>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">
              <Link to="." search={{ uninstallGameModal: { open: false } }}>
                Cancel
              </Link>
            </Button>
          </DialogClose>

          <Button
            disabled={
              isPending || installationState !== InstallationStatus.INSTALLED
            }
            className="relative"
            variant="destructive"
            onClick={() => {
              uninstall()
                .then(() =>
                  navigate({
                    to: ".",
                    search: { uninstallGameModal: undefined },
                  }),
                )
                .catch(console.error);
            }}
          >
            <LoaderCircleIcon
              className={cn("animate-spin absolute", !isPending && "opacity-0")}
            />
            <p className={cn(isPending && "opacity-0")}>Uninstall</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
