import { CircleAlertIcon, LoaderCircleIcon } from "lucide-react";
import { ProfileList } from "./profile-list";
import { Button } from "@retrom/ui/components/button";
import { ScrollArea, ScrollBar } from "@retrom/ui/components/scroll-area";
import { Accordion } from "@retrom/ui/components/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { useEmulatorProfiles } from "@/queries/useEmulatorProfiles";
import { useEmulators } from "@/queries/useEmulators";
import { useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";

export function ManageEmulatorProfilesModal() {
  const navigate = useNavigate();
  const { manageEmulatorProfilesModal } = RootRoute.useSearch();

  const { data: emulators, status: emulatorsStatus } = useEmulators({
    selectFn: (res) => res.emulators,
  });
  const { data: profiles, status: profilesStatus } = useEmulatorProfiles({
    selectFn: (res) => res.profiles,
  });

  const loading = emulatorsStatus === "pending" || profilesStatus === "pending";
  const error = emulatorsStatus === "error" || profilesStatus === "error";

  return (
    <Dialog
      modal={true}
      open={manageEmulatorProfilesModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            to: ".",
            search: (prev) => ({
              ...prev,
              manageEmulatorProfilesModal: undefined,
            }),
          });
        }
      }}
    >
      <DialogContent className="w-[clamp(300px,65dvw,1000px)]">
        <DialogHeader>
          <DialogTitle>Manage Emulator Profiles</DialogTitle>
          <DialogDescription>
            Create, edit, and delete emulator profiles. Emulator profiles define
            the settings for each emulator, such as the path to the executable.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoaderCircleIcon className="w-8 h-8 animate-spin" />
        ) : error ? (
          <></>
        ) : (
          <ScrollArea type="auto">
            <Accordion type="multiple" className="w-full max-w-full">
              {emulators.map((emulator) => (
                <ProfileList
                  key={emulator.id}
                  emulator={emulator}
                  profiles={profiles.filter(
                    (p) => p.emulatorId === emulator.id,
                  )}
                />
              ))}

              {emulators.length === 0 && (
                <div className="flex justify-center items-center gap-2 text-muted-foreground mt-8">
                  <CircleAlertIcon className="w-[2rem] h-[2rem]" />
                  <p className="text-center">
                    No emulators found. Please add an emulator to create
                    profiles.
                  </p>
                </div>
              )}
            </Accordion>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
