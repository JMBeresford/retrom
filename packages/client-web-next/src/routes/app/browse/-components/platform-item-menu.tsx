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
import type { PlatformMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { ComponentProps } from "react";
import { useUpdatePlatformMetadata } from "@/data/metadata/use-update-platform-metadata";
import { useModalAction } from "@/modals/use-modal-action";

export type PlatformItemMenuProps = {
  metadata?: PlatformMetadata;
} & ComponentProps<typeof Button>;

export function PlatformItemMenu({
  metadata,
  className,
  ...props
}: PlatformItemMenuProps) {
  const { mutate: updatePlatformMetadata } = useUpdatePlatformMetadata();
  const platformFormDialog = useModalAction("platformForm");
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
            <DropdownMenuLabel>Manage Platform</DropdownMenuLabel>
            <DropdownMenuItem
              disabled={!metadata}
              onClick={() => {
                platformFormDialog.openModal({
                  title: "Edit Platform Metadata",
                  description: "Edit the metadata for this platform.",
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
                  description: "Search IGDB for metadata for this platform.",
                  initialValue: {
                    name: metadata.name,
                  },
                  searchType: "platform",
                  platformId: metadata.platform,
                  onSubmit: (selectedMetadata) => {
                    confirmDialog.openModal({
                      title: "Updating Platform Metadata",
                      description:
                        "Are you sure you want to update the metadata for this platform?",
                      onConfirm: () => {
                        updatePlatformMetadata(
                          {
                            metadata: {
                              ...selectedMetadata,
                              name: metadata.name || selectedMetadata.name,
                            },
                          },
                          {
                            onError: (error) => {
                              toast.add({
                                title: "Failed to update platform",
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
