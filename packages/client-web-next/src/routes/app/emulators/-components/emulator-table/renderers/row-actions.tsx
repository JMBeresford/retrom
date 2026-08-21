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
import { Link } from "@tanstack/react-router";
import type { Row } from "@tanstack/react-table";
import type { EmulatorTableFeatures } from "../defs";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import { useModalAction } from "@/modals/use-modal-action";
import { useDeleteEmulator } from "@/data/emulators/use-delete-emulator";

export function RowActions({
  row,
}: {
  row: Row<EmulatorTableFeatures, Emulator>;
}) {
  const confirmModal = useModalAction("confirm");
  const emulatorFormModal = useModalAction("emulatorForm");
  const { mutate: deleteEmulator } = useDeleteEmulator();

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
            render={
              <Link
                to="/app/emulators/$emulator-id"
                params={{ "emulator-id": row.original.id }}
              >
                Manage
              </Link>
            }
          />

          <DropdownMenuItem
            onClick={() => {
              emulatorFormModal.openModal({
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
                title: "Delete Emulator",
                description: (
                  <p>
                    This will remove the emulator {row.original.name} and all
                    associated data. This will not remove anything from your
                    filesystem, only Retrom&apos;s internal data will be
                    affected.
                  </p>
                ),
                onConfirm: () => {
                  deleteEmulator(
                    { id: row.original.id },
                    {
                      onError: (error) => {
                        toast.add({
                          title: "Failed to delete emulator",
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
