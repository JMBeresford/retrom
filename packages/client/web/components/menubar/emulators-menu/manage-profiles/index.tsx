"use client";

import { Accordion } from "@/components/ui/accordion";
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
import { MenubarItem } from "@/components/ui/menubar";
import { useEmulatorProfiles } from "@/queries/useEmulatorProfiles";
import { useEmulators } from "@/queries/useEmulators";
import { CircleAlertIcon, LoaderCircleIcon } from "lucide-react";
import { ProfileList } from "./profile-list";
import { Button } from "@/components/ui/button";

export function ManageProfilesMenuItem() {
  const { data: emulators, status: emulatorsStatus } = useEmulators({
    selectFn: (res) => res.emulators,
  });
  const { data: profiles, status: profilesStatus } = useEmulatorProfiles({
    selectFn: (res) => res.profiles,
  });

  const loading = emulatorsStatus === "pending" || profilesStatus === "pending";
  const error = emulatorsStatus === "error" || profilesStatus === "error";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          Manage Profiles
        </MenubarItem>
      </DialogTrigger>

      <DialogContent>
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
          <Accordion type="multiple">
            {emulators.map((emulator) => (
              <ProfileList
                key={emulator.id}
                emulator={emulator}
                profiles={profiles.filter((p) => p.emulatorId === emulator.id)}
              />
            ))}

            {emulators.length === 0 && (
              <div className="flex justify-center items-center gap-2 text-muted-foreground mt-8">
                <CircleAlertIcon className="w-[2rem] h-[2rem]" />
                <p className="text-center">
                  No emulators found. Please add an emulator to create profiles.
                </p>
              </div>
            )}
          </Accordion>
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
