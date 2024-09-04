import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, getFileName } from "@/lib/utils";
import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, LoaderCircleIcon } from "lucide-react";
import { useDeleteGameFiles } from "@/mutations/useDeleteGameFile";
import { useUpdateGameFiles } from "@/mutations/useUpdateGameFiles";
import { useToast } from "@/components/ui/use-toast";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateGames } from "@/mutations/useUpdateGames";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  }, [deleteGameFiles, toast, selectedFile, gameFiles, deleteFromDisk]);

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
    } catch (error) {
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

  return (
    <>
      <Card className="col-span-2 ring-inset relative">
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-px w-full grid-flow-col grid-cols-[minmax(0,1fr)_auto] [&_*]:ring-inset">
          <Select
            value={selectedFile}
            onValueChange={setSelectedFile}
            disabled={!gameFiles.length}
          >
            <SelectTrigger
              className={cn(
                selectedFile === undefined && "text-muted-foreground",
                "text-left rounded-r-none w-full",
              )}
            >
              <SelectValue
                placeholder={
                  gameFiles.length ? "Select a file" : "No files found"
                }
              />
            </SelectTrigger>

            <SelectContent
              position="popper"
              side="bottom"
              className="max-h-[calc(var(--radix-select-content-available-height)*0.85)]"
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
                    <div className="flex items-center">
                      <span className="overflow-ellipsis overflow-hidden relative">
                        <span className="whitespace-nowrap">
                          {getFileName(file.path)}
                        </span>
                      </span>
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

            <DropdownMenuContent>
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
                        Change the name of the file on both Retrom and the file
                        system
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

                        <Button onClick={handleRename} disabled={pending}>
                          {pending ? (
                            <LoaderCircleIcon className="animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
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
                      will leave your file system as is, but Retrom will ignore
                      the file moving forward.
                    </p>

                    <DialogFooter>
                      <div className="flex items-center justify-between gap-6 w-full">
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
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </>
  );
}
