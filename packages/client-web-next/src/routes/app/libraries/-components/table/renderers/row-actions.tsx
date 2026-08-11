import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@retrom/ui-next/components/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { Button } from "@retrom/ui-next/components/button";
import { toast } from "@retrom/ui-next/components/toast";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import type { Row } from "@tanstack/react-table";
import type { LibraryTableFeatures } from "../defs";
import { useDeleteLibrary } from "@/data/libraries/use-delete-library";
import { useModalAction } from "@/modals/use-modal-action";

export function RowActions({
  row,
}: {
  row: Row<LibraryTableFeatures, Library>;
}) {
  const confirmModal = useModalAction("confirm");
  const libraryFormModal = useModalAction("libraryForm");
  const { mutate: deleteLibrary } = useDeleteLibrary();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="icon" variant="ghost">
            <EllipsisVerticalIcon />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              libraryFormModal.openModal({
                action: "update",
                currentValue: row.original,
              });
            }}
          >
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              confirmModal.openModal({
                title: "Delete Library",
                description: (
                  <p>
                    This will remove the library {row.original.name} and all
                    associated data. This will not remove anything from your
                    filesystem, only Retrom&apos;s internal data will be
                    affected.
                  </p>
                ),
                onConfirm: () => {
                  deleteLibrary(
                    { id: row.original.id },
                    {
                      onError: (error) => {
                        toast.add({
                          title: "Failed to delete library",
                          description: error.message,
                          timeout: 0,
                        });
                      },
                    },
                  );
                },
              })
            }
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
