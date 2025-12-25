import { useUpdateGames } from "@/mutations/useUpdateGames";
import { useGameDetail } from "@/providers/game-details";
import { useModalAction } from "@/providers/modal-action";
import { Badge } from "@retrom/ui/components/badge";
import { Button } from "@retrom/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@retrom/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@retrom/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@retrom/ui/components/select";
import { Separator } from "@retrom/ui/components/separator";
import { useToast } from "@retrom/ui/hooks/use-toast";
import { cn } from "@retrom/ui/lib/utils";
import { EllipsisVerticalIcon } from "lucide-react";
import { useCallback, useState } from "react";

export function GameFiles() {
  const { gameFiles, game } = useGameDetail();
  const { toast } = useToast();
  const { openModal: openDeleteFileModal } = useModalAction("deleteFileModal");
  const { openModal: openRenameFileModal } = useModalAction("renameFileModal");
  const { mutateAsync: updateGames, status: updateGameStatus } =
    useUpdateGames();

  const [selectedFile, setSelectedFile] = useState<number | undefined>();

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

  const pending = updateGameStatus === "pending";

  if (gameFiles.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="ring-inset">
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>

        <CardContent className={cn("[&_*]:ring-inset")}>
          <div
            className={cn(
              "relative grid gap-px w-full",
              "grid-flow-col grid-cols-[minmax(0,1fr)_auto] ",
              "[&_[data-radix-popper-content-wrapper]]:contents",
            )}
          >
            <Select
              value={selectedFile?.toString()}
              onValueChange={(v) => setSelectedFile(Number(v))}
              disabled={!gameFiles.length}
            >
              <SelectTrigger
                className={cn(
                  selectedFile === undefined && "text-muted-foreground",
                  "text-left rounded-r-none w-full whitespace-nowrap",
                  "flex overflow-hidden overflow-ellipsis",
                )}
              >
                <SelectValue
                  className="w-fit"
                  placeholder={
                    gameFiles.length ? "Select a file" : "No files found"
                  }
                />
              </SelectTrigger>

              <SelectContent position="popper" side="bottom" align="end">
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
                      <div className="flex items-center max-w-[40ch]">
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
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-l-none"
                >
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                portal={false}
                align="start"
                className={cn("absolute inset-x-0 sm:left-auto top-full mt-1")}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={pending}
                    onClick={handleMakeDefault}
                  >
                    Set as default
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={pending}
                    onSelect={() => {
                      const file = gameFiles.find(
                        (file) => file.id === selectedFile,
                      );

                      if (file) {
                        openRenameFileModal({
                          file,
                        });
                      }
                    }}
                  >
                    Rename
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <Separator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={pending}
                    className="text-destructive-text"
                    onSelect={() => {
                      if (selectedFile === undefined) {
                        return;
                      }

                      openDeleteFileModal({ fileId: selectedFile });
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
