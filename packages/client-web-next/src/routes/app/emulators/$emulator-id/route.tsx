import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Separator } from "@retrom/ui-next/components/separator";
import { Button } from "@retrom/ui-next/components/button";
import { EmulatorsHeading } from "../-components/emulators-heading";
import { EmulatorProfileTable } from "./-components/emulator-profiles-table";
import { EmulatorProfileFormDialog } from "./-components/emulator-profile-form-dialog";
import { useGetEmulator } from "@/data/emulators/use-get-emulator";
import { ConfirmDialog } from "@/modals/confirm-modal";
import { useModalAction } from "@/modals/use-modal-action";

export const Route = createFileRoute("/app/emulators/$emulator-id")({
  component: RouteComponent,
});

function RouteComponent() {
  const emulatorId = Route.useParams()["emulator-id"];
  const emulatorProfileFormModal = useModalAction("emulatorProfileForm");
  const emulatorQuery = useGetEmulator({ request: { id: emulatorId } });

  if (emulatorQuery.isPending) {
    return (
      <div className="grid place-items-center w-full py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (emulatorQuery.isError) {
    return <Navigate to="/app/emulators" />;
  }

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex gap-2">
          <EmulatorsHeading />

          <span className="font-heading text-4xl font-bold text-muted-foreground">
            /
          </span>

          <h1 className="font-heading text-4xl font-bold">
            {emulatorQuery.data.name}
          </h1>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <div className="flex gap-2 items-center">
            <h3 className="font-heading text-2xl font-bold">Profiles</h3>

            <Separator orientation="vertical" />

            <Button
              size="sm"
              onClick={() =>
                emulatorProfileFormModal.openModal({
                  title: "Add Emulator Profile",
                  description: `Configure Retrom to track a new emulator profile for ${emulatorQuery.data.name}.`,
                  action: "create",
                  emulator: emulatorQuery.data.id,
                })
              }
            >
              Add Profile
            </Button>
          </div>

          <EmulatorProfileTable />
        </div>
      </div>

      <EmulatorProfileFormDialog />
      <ConfirmDialog />
    </>
  );
}
