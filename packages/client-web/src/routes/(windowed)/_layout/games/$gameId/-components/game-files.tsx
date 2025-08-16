import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@retrom/ui/components/card";
import { Button } from "@retrom/ui/components/button";
import { Separator } from "@retrom/ui/components/separator";
import { getFileName } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@retrom/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@retrom/ui/components/dropdown-menu";
import { EllipsisVerticalIcon, LoaderCircleIcon } from "lucide-react";
import { useDeleteGameFiles } from "@/mutations/useDeleteGameFile";
import { useUpdateGameFiles } from "@/mutations/useUpdateGameFiles";
import { useToast } from "@retrom/ui/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@retrom/ui/components/dialog";
import { Checkbox } from "@retrom/ui/components/checkbox";
import { useUpdateGames } from "@/mutations/useUpdateGames";
import { Badge } from "@retrom/ui/components/badge";
import { Input } from "@retrom/ui/components/input";
import { useGameDetail } from "@/providers/game-details";

export function GameFiles() {
  const { gameFiles, game } = useGameDetail();
  const { toast } = useToast();
  const { mutateAsync: updateGames, status: updateGameStatus } =
    useUpdateGames();
  const { mutateAsync: deleteGameFiles, status: deletionStatus } =
    useDeleteGameFiles();
  const { mutateAsync: updateGameFiles, status: updateStatus } =
    useUpdateGameFiles();

  const [deleteFromDisk, setDeleteFromDisk] = useState(false);
  const [blacklistEntries, setBlacklistEntries] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [renameValue, setRenameValue] = useState("");

  const handleDelete = useCallback(async () => {
    const file = selectedFile
      ? gameFiles.find((file) => file.id === +selectedFile)
      : undefined;

    if (!file) return;

    try {
      const res = await deleteGameFiles({
        ids: [file.id],
        blacklistEntries,
        deleteFromDisk,
      });

      if (!res.gameFilesDeleted.length) {
        throw new Error("Failed to delete file");
      }

      toast({
        title: "File deleted",
        description: "The file has been deleted",
      });

      setSelectedFile("");
    } catch {
      toast({
        title: "Failed to delete file",
        description:
          "An error occurred while deleting the file, please try again.",
        variant: "destructive",
      });
    }
  }, [
    deleteGameFiles,
    toast,
    selectedFile,
    gameFiles,
    deleteFromDisk,
    blacklistEntries,
  ]);

  const handleMakeDefault = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const id = +selectedFile;
      const res = await updateGames({
        games: [{ id: game.id, defaultFileId: id }],
      });

      if (!res.gamesUpdated.length) {
        throw new Error("Failed to update game");
      }

      toast({
        title: "Game updated",
        description: "New default file has been set",
      });
    } catch {
      toast({
        title: "Failed to update game",
        description:
          "An error occurred while updating the game, please try again.",
        variant: "destructive",
      });
    }
  }, [game, toast, updateGames, selectedFile]);

  const handleRename = useCallback(async () => {
    const fileId = +selectedFile;

    if (typeof fileId !== "number") return;

    try {
      const currentPath = gameFiles.find((f) => f.id === fileId)?.path;

      if (!currentPath) {
        throw new Error("Failed to find specified file");
      }

      const newPath = currentPath.replace(
        getFileName(currentPath),
        renameValue,
      );

      const res = await updateGameFiles({
        gameFiles: [{ id: fileId, path: newPath }],
      });

      if (!res.gameFilesUpdated.length) {
        throw new Error("Failed to update file");
      }

      toast({
        title: "File updated",
        description: "The file has been renamed",
      });
    } catch {
      toast({
        title: "Failed to update file",
        description:
          "An error occurred while updating the file, please try again.",
        variant: "destructive",
      });
    }
  }, [selectedFile, renameValue, updateGameFiles, toast, gameFiles]);

  const pending =
    deletionStatus === "pending" ||
    updateStatus === "pending" ||
    updateGameStatus === "pending";

  if (gameFiles.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="ring-inset">
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>

        <CardContent
          className={cn(
            "[&_*]:ring-inset",
            "[&_[data-radix-popper-content-wrapper]]:contents",
            "sm:[&_[data-radix-popper-content-wrapper]]:block",
          )}
        >
          <div
            className={cn(
              "relative grid gap-px w-full",
              "grid-flow-col grid-cols-[minmax(0,1fr)_auto] ",
            )}
          >
            <Select
              value={selectedFile}
              onValueChange={setSelectedFile}
              disabled={!gameFiles.length}
            >
              <SelectTrigger
                className={cn(
                  selectedFile === undefined && "text-muted-foreground",
                  "text-left rounded-r-none w-full whitespace-nowrap",
                  "overflow-hidden text-ellipsis",
                )}
              >
                <SelectValue
                  placeholder={
                    gameFiles.length ? "Select a file" : "No files found"
                  }
                />
              </SelectTrigger>

              <SelectContent
                side="bottom"
                className="max-h-[calc(var(--radix-select-content-available-height)*0.85)] w-min"
              >
                {gameFiles
                  ?.sort((a, b) => {
                    if (game.defaultFileId === a.id) {
                      return -1;
                    }

                    if (game.defaultFileId === b.id) {
                      return 1;
                    }

                    return 0;
                  })
                  .map((file) => (
                    <SelectItem key={file.id} value={file.id.toString()}>
                      <div className="flex items-center w-fit">
                        <div className="relative break-word">
                          {file.path.replace(
                            game.path.split("/").slice(0, -2).join("/"),
                            "",
                          )}
                        </div>
                        {file.id === game.defaultFileId ? (
                          <Badge className="ml-2" variant="secondary">
                            default
                          </Badge>
                        ) : null}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!selectedFile}>
                <Button size="icon" variant="outline" className="rounded-r-md">
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                portal={false}
                className="z-[10] absolute sm:relative top-full inset-x-0 mt-2 sm:mt-0"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleMakeDefault}>
                    Set as default
                  </DropdownMenuItem>

                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => {
                          const file = gameFiles.find(
                            (file) => file.id === +selectedFile,
                          );

                          if (file) setRenameValue(getFileName(file.path));
                        }}
                      >
                        Rename
                      </DropdownMenuItem>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rename Game File</DialogTitle>
                        <DialogDescription>
                          Change the name of the file on both Retrom and the
                          file system
                        </DialogDescription>
                      </DialogHeader>

                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                      />

                      <DialogFooter>
                        <div className="flex gap-2">
                          <DialogClose asChild>
                            <Button disabled={pending} variant="secondary">
                              Cancel
                            </Button>
                          </DialogClose>

                          <DialogClose asChild>
                            <Button onClick={handleRename} disabled={pending}>
                              {pending ? (
                                <LoaderCircleIcon className="animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuGroup>

                <Separator />

                <DropdownMenuGroup>
                  <Dialog>
                    <DialogTrigger asChild className="text-destructive-text">
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DialogTrigger>

                    <DialogContent className="max-w-[65ch]">
                      <DialogHeader>
                        <DialogTitle>Delete Game File</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this file?
                        </DialogDescription>
                      </DialogHeader>

                      <p className="pb-2">
                        You can either delete the entry from the database or
                        delete the file from the disk. Deleting only the entry
                        will leave your file system as is, but Retrom will
                        ignore the file moving forward.
                      </p>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-top gap-2">
                          <Checkbox
                            id="delete-from-disk"
                            checked={deleteFromDisk}
                            onCheckedChange={(event) =>
                              setDeleteFromDisk(!!event)
                            }
                          />

                          <div className="grid gap-1 5 leading-none">
                            <label htmlFor="delete-from-disk">
                              Delete from disk
                            </label>

                            <p className="text-sm text-muted-foreground">
                              This will alter the file system
                            </p>
                          </div>
                        </div>

                        <div className="flex items-top gap-2">
                          <Checkbox
                            id="blacklist-entries"
                            checked={blacklistEntries}
                            onCheckedChange={(event) =>
                              setBlacklistEntries(!!event)
                            }
                          />

                          <div className="grid gap-1 5 leading-none">
                            <label htmlFor="blacklist-entries">
                              Blacklist entry
                            </label>

                            <p className="text-sm text-muted-foreground max-w-[45ch]">
                              Enabling this will prevent the file from being
                              re-imported in any future library scans
                            </p>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <div className="flex gap-2">
                          <DialogClose asChild>
                            <Button disabled={pending}>Cancel</Button>
                          </DialogClose>

                          <Button
                            onClick={handleDelete}
                            variant="destructive"
                            disabled={pending}
                          >
                            Delete
                          </Button>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
