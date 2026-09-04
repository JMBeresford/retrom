import { Button } from "@retrom/ui-next/components/button";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@retrom/ui-next/components/dropdown-menu";
import { cn } from "@retrom/ui-next/lib/utils";
import { toast } from "@retrom/ui-next/components/toast";
import type { ComponentProps } from "react";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import { useModalAction } from "@/modals/use-modal-action";
import { useUpdateGameMetadata } from "@/data/metadata/use-update-game-metadata";

export type GameItemMenuProps = {
  metadata?: GameMetadata;
} & ComponentProps<typeof Button>;

export function GameItemMenu({
  metadata,
  className,
  ...props
}: GameItemMenuProps) {
  const { mutate: updateGameMetadata } = useUpdateGameMetadata();
  const gameFormDialog = useModalAction("gameForm");
  const searchIgdbDialog = useModalAction("igdbSearchForm");
  const confirmDialog = useModalAction("confirm");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={!metadata}
        render={
          <Button
            className={cn(
              "opacity-0 transition-opacity group-hover:opacity-100",
              className,
            )}
            size="icon"
            variant="ghost"
            {...props}
          >
            <EllipsisVertical />
          </Button>
        }
      />

      {metadata && (
        <DropdownMenuContent className="w-max">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Manage Game</DropdownMenuLabel>
            <DropdownMenuItem
              disabled={!metadata}
              onClick={() => {
                gameFormDialog.openModal({
                  title: "Edit Game Metadata",
                  description: "Edit the metadata for this game.",
                  action: "update",
                  currentValue: metadata,
                });
              }}
            >
              Edit Metadata
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!metadata}
              onClick={() => {
                searchIgdbDialog.openModal({
                  title: "Search IGDB",
                  description: "Search IGDB for metadata for this game.",
                  initialValue: {
                    name: metadata.name,
                  },
                  searchType: "game",
                  gameId: metadata.game,
                  onSubmit: (selectedMetadata) => {
                    confirmDialog.openModal({
                      title: "Updating Game Metadata",
                      description:
                        "Are you sure you want to update the metadata for this game?",
                      onConfirm: () => {
                        updateGameMetadata(
                          {
                            metadata: {
                              ...selectedMetadata,
                              id: metadata.id || selectedMetadata.id,
                            },
                          },
                          {
                            onError: (error) => {
                              toast.add({
                                title: "Failed to update game",
                                type: "error",
                                description: error.message,
                              });
                            },
                          },
                        );
                      },
                    });
                  },
                });
              }}
            >
              Search Metadata
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
