"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useDialogOpen,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MenubarItem } from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Platform } from "@/generated/retrom/models/platforms";
import {
  DefaultEmulatorProfile,
  Emulator,
  EmulatorProfile,
  UpdatedDefaultEmulatorProfile,
} from "@/generated/retrom/models/emulators";
import { cn, InferSchema } from "@/lib/utils";
import { useUpdateDefaultEmulatorProfiles } from "@/mutations/useUpdateDefaultEmulatorProfiles";
import { useDefaultEmulatorProfiles } from "@/queries/useDefaultEmulatorProfiles";
import { useEmulatorProfiles } from "@/queries/useEmulatorProfiles";
import { useEmulators } from "@/queries/useEmulators";
import { usePlatforms } from "@/queries/usePlatforms";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  CircleAlertIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

export function DefaultProfilesMenuItem() {
  const { data: platforms, status: platformStatus } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) => data.platforms,
  });

  const { data: emulatorProfiles, status: profilesStatus } =
    useEmulatorProfiles({
      selectFn: (data) => data.profiles,
    });

  const { data: defaultProfiles, status: defaultProfilesStatus } =
    useDefaultEmulatorProfiles({
      selectFn: (data) => data.defaultProfiles,
    });

  const { data: emulators, status: emulatorsStatus } = useEmulators({
    selectFn: (data) => data.emulators,
  });

  const pending =
    platformStatus === "pending" ||
    profilesStatus === "pending" ||
    emulatorsStatus === "pending" ||
    defaultProfilesStatus === "pending";

  const error =
    platformStatus === "error" ||
    profilesStatus === "error" ||
    emulatorsStatus === "error" ||
    defaultProfilesStatus === "error";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          Default Profiles
        </MenubarItem>
      </DialogTrigger>

      {pending ? (
        <DialogContent>
          <LoaderCircleIcon className="w-8 h-8 animate-spin" />
        </DialogContent>
      ) : error ? (
        <DialogContent>
          <CircleAlertIcon className="w-8 h-8 text-error" />
        </DialogContent>
      ) : (
        <DefaultEmulatorProfiles
          platforms={platforms}
          emulators={emulators}
          defaultProfiles={defaultProfiles}
          emulatorProfiles={emulatorProfiles}
        />
      )}
    </Dialog>
  );
}

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  defaultProfiles: z.array(
    z.object({
      platformId: z.number(),
      emulatorProfileId: z.number().optional(),
    }) satisfies InferSchema<
      Omit<UpdatedDefaultEmulatorProfile, "emulatorProfileId"> & {
        emulatorProfileId?: number;
      }
    >,
  ),
});

function DefaultEmulatorProfiles(props: {
  platforms: Platform[];
  emulators: Emulator[];
  defaultProfiles: DefaultEmulatorProfile[];
  emulatorProfiles: EmulatorProfile[];
}) {
  const { platforms, defaultProfiles, emulatorProfiles, emulators } = props;
  const { setOpen } = useDialogOpen();
  const { mutate: updateDefaultEmulatorProfiles } =
    useUpdateDefaultEmulatorProfiles();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultProfiles: platforms.map((platform) => ({
        platformId: platform.id,
        emulatorProfileId: defaultProfiles.find(
          (profile) => profile.platformId === platform.id,
        )?.emulatorProfileId,
      })),
    },
  });

  useEffect(() => {
    const values = platforms.map((platform) => ({
      platformId: platform.id,
      emulatorProfileId: defaultProfiles.find(
        (profile) => profile.platformId === platform.id,
      )?.emulatorProfileId,
    }));

    form.reset({ defaultProfiles: values });
  }, [platforms, defaultProfiles, form]);

  const { fields: defaults } = useFieldArray({
    control: form.control,
    name: "defaultProfiles",
  });

  const handleSubmit = useCallback(
    (values: FormSchema) => {
      const defaultProfiles = [];
      for (const { platformId, emulatorProfileId } of values.defaultProfiles) {
        if (emulatorProfileId !== undefined) {
          defaultProfiles.push({
            platformId,
            emulatorProfileId,
          });
        }
      }

      updateDefaultEmulatorProfiles({
        defaultProfiles,
      });

      setOpen(false);
    },
    [updateDefaultEmulatorProfiles, setOpen],
  );

  return (
    <DialogContent className="w-fit">
      <DialogHeader>
        <DialogTitle>Default Profiles</DialogTitle>
        <DialogDescription>
          Manage the default emulator profiles for each platform. These
          selections dictate how games are launched by default.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {defaults.map((field, index) => {
            const platform = platforms.find((p) => p.id === field.platformId);

            if (!platform) {
              return null;
            }

            const relativePath =
              ".../" + (platform.path.split("/").pop() ?? platform.path);

            return (
              <FormField
                key={index}
                name={`defaultProfiles.${index}` as const}
                control={form.control}
                render={({ field, fieldState }) => {
                  const { platformId, emulatorProfileId } = field.value;

                  const currentDefaultProfile = defaultProfiles.find(
                    (p) => p.platformId === platformId,
                  );

                  const selectedProfile = emulatorProfiles.find(
                    (p) => p.id === emulatorProfileId,
                  );

                  const emulatorForSelection = emulators.find(
                    (e) => e.id === selectedProfile?.emulatorId,
                  );

                  const displayText =
                    selectedProfile !== undefined
                      ? `${emulatorForSelection?.name} - ${selectedProfile.name}`
                      : "Select a profile...";

                  const unchanged =
                    currentDefaultProfile?.emulatorProfileId ===
                      emulatorProfileId && !fieldState.isDirty;

                  return (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-2">
                          <code className="relative px-2 border-l border-y bg-muted grid place-items-center">
                            <pre className="h-min w-full text-muted-foreground font-mono text-sm font-semibold">
                              {relativePath}
                            </pre>
                          </code>
                          <Popover modal={true}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  (field.value === undefined ||
                                    !fieldState.isDirty) &&
                                    "text-muted-foreground",
                                  "justify-between z-10",
                                )}
                              >
                                <span>
                                  {displayText}
                                  {unchanged && (
                                    <span className="text-xs opacity-50">
                                      {" (unchanged)"}
                                    </span>
                                  )}
                                </span>

                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="p-0">
                              <Command>
                                <CommandInput placeholder="Search platforms..." />
                                <CommandList>
                                  <CommandGroup>
                                    {emulatorProfiles.map((profile) => {
                                      const emulator = emulators.find(
                                        (e) => e.id === profile.emulatorId,
                                      );

                                      if (!emulator) {
                                        console.warn(
                                          "Emulator not found for emulator profile: ",
                                          profile,
                                        );
                                        return null;
                                      }

                                      const displayName = `${emulator.name} - ${profile.name}`;

                                      return (
                                        <CommandItem
                                          key={profile.id}
                                          value={displayName}
                                          onSelect={() => {
                                            field.onChange({
                                              ...field.value,
                                              emulatorProfileId: profile.id,
                                            });
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value.emulatorProfileId ===
                                                profile.id
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                          <div>
                                            {displayName}
                                            {profile.id ===
                                              currentDefaultProfile?.emulatorProfileId && (
                                              <span className="text-xs opacity-50">
                                                {" (current)"}
                                              </span>
                                            )}
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            );
          })}

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
