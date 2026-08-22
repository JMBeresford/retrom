import { Button } from "@retrom/ui-next/components/button";
import { Separator } from "@retrom/ui-next/components/separator";
import { createFileRoute } from "@tanstack/react-router";
import { EmulatorTable } from "./-components/emulator-table/emulator-table";
import { EmulatorFormDialog } from "./-components/emulator-form-dialog";
import { EmulatorsHeading } from "./-components/emulators-heading";
import { ConfirmDialog } from "@/modals/confirm-modal";
import { useModalAction } from "@/modals/use-modal-action";

export const Route = createFileRoute("/app/emulators/")({
  component: RouteComponent,
});

function RouteComponent() {
  const emulatorFormModal = useModalAction("emulatorForm");

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex gap-2 items-end">
          <EmulatorsHeading />

          <Separator orientation="vertical" />

          <Button
            onClick={() =>
              emulatorFormModal.openModal({
                title: "Add Emulator",
                description: "Configure Retrom to track a new emulator.",
                action: "create",
              })
            }
          >
            Add Emulator
          </Button>
        </div>

        <p className="pretty max-w-prose text-muted-foreground">
          These are the emulators that you have configured in this Retrom
          instance. You can add, edit, or delete emulators as needed. Select an
          emulator by name to manage launch profiles and other configurations.
        </p>

        <div className="mt-4">
          <EmulatorTable />
        </div>
      </div>

      <EmulatorFormDialog />
      <ConfirmDialog />
    </>
  );
}
