import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LoaderCircleIcon } from "lucide-react";
import { useDeletePlatforms } from "@/mutations/useDeletePlatforms";
import { Route as RootRoute } from "@/routes/__root";

export function DeletePlatformModal() {
  const { toast } = useToast();
  const [deleteFromDisk, setDeleteFromDisk] = useState(false);
  const [blacklistEntries, setBlacklistEntries] = useState(false);
  const { deletePlatformModal } = RootRoute.useSearch();
  const platform = deletePlatformModal?.platform;
  const navigate = RootRoute.useNavigate();

  const { mutateAsync: deletePlatforms, isPending } = useDeletePlatforms();

  const handleDelete = useCallback(async () => {
    try {
      if (!platform) {
        return;
      }

      const res = await deletePlatforms({
        ids: [platform.id],
        deleteFromDisk,
        blacklistEntries,
      });

      if (!platform.thirdParty && !res.platformsDeleted.length) {
        throw new Error("Failed to delete platform");
      }

      toast({
        title: `Platform deleted: ${platform.name}`,
      });

      navigate({
        to: "/home",
        search: (prev) => ({ ...prev, deletePlatformModal: undefined }),
      }).catch(console.error);
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to delete platform",
      });
    }
  }, [
    deletePlatforms,
    platform,
    deleteFromDisk,
    blacklistEntries,
    toast,
    navigate,
  ]);

  return (
    <Dialog
      open={deletePlatformModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          navigate({
            search: (prev) => ({ ...prev, deletePlatformModal: undefined }),
          }).catch(console.error);
        }
      }}
    >
      <DialogContent className="max-w-[60ch]">
        <DialogHeader>
          <DialogTitle>Delete Platform</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {platform?.name ?? "this platform"}?
          </DialogDescription>
        </DialogHeader>

        <p className="pb-2">
          You can either delete the entry from the database or delete the
          platform from the disk. Deleting only the entry will leave your file
          system as is, but Retrom will ignore the platform&apos;s directory
          moving forward.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-top gap-2">
            <Checkbox
              id="delete-from-disk"
              checked={deleteFromDisk}
              disabled={platform?.thirdParty}
              onCheckedChange={(event) => setDeleteFromDisk(!!event)}
            />

            <div
              className={cn(
                "grid gap-1 5 leading-none",
                platform?.thirdParty && "opacity-50",
              )}
            >
              <label htmlFor="delete-from-disk">Delete from disk</label>

              <p className="text-sm text-muted-foreground">
                This will alter the the file system
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Checkbox
              id="blacklist-entries"
              checked={blacklistEntries}
              onCheckedChange={(event) => setBlacklistEntries(!!event)}
            />

            <div className="grid gap-1 5 leading-none">
              <label htmlFor="blacklist-entries">Blacklist entries</label>

              <p className="text-sm text-muted-foreground max-w-[45ch]">
                Enabling this will prevent the platform and its files from being
                re-imported in any future library scans
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
