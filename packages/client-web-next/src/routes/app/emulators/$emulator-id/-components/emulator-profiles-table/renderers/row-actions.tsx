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
import type { Row } from "@tanstack/react-table";
import type { EmulatorProfileTableFeatures } from "../defs";
import type { EmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";
import { useModalAction } from "@/modals/use-modal-action";
import { useDeleteEmulatorProfile } from "@/data/emulators/use-delete-emulator-profile";

export function RowActionsCell({
  row,
}: {
  row: Row<EmulatorProfileTableFeatures, EmulatorProfile>;
}) {
  const confirmModal = useModalAction("confirm");
  const emulatorProfileFormModal = useModalAction("emulatorProfileForm");
  const { mutate: deleteEmulatorProfile } = useDeleteEmulatorProfile();

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
              emulatorProfileFormModal.openModal({
                title: "Update Emulator Profile",
                description: "Change the settings for this emulator profile.",
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
                title: "Delete Emulator Profile",
                description: (
                  <p>
                    This will remove the emulator {row.original.name} and all
                    associated data.
                  </p>
                ),
                onConfirm: () => {
                  deleteEmulatorProfile(
                    { id: row.original.id },
                    {
                      onError: (error) => {
                        toast.add({
                          title: "Failed to delete emulator profile",
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
