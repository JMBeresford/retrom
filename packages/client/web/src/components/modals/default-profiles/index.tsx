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
  useDialogOpen,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DefaultEmulatorProfile,
  Emulator,
  EmulatorProfile,
  UpdatedDefaultEmulatorProfile,
} from "@/generated/retrom/models/emulators";
import { cn, getFileStub, InferSchema } from "@/lib/utils";
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
import { useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { useConfig } from "@/providers/config";
import { Label } from "@/components/ui/label";
import { PlatformWithMetadata } from "../manage-emulators";

export function DefaultProfilesModal() {
  const navigate = useNavigate();
  const { defaultProfilesModal } = RootRoute.useSearch();
  const { data: platforms, status: platformStatus } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) =>
      data.platforms
        .filter((platform) => !platform.thirdParty)
        .map((platform) => {
          const metadata = data.metadata.find(
            (m) => m.platformId === platform.id,
          );

          return {
            ...platform,
            metadata,
          };
        }),
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
    <Dialog
      open={defaultProfilesModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ search: { defaultProfilesModal: undefined } });
        }
      }}
    >
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
  platforms: PlatformWithMetadata[];
  emulators: Emulator[];
  defaultProfiles: DefaultEmulatorProfile[];
  emulatorProfiles: EmulatorProfile[];
}) {
  const clientId = useConfig((s) => s.config.clientInfo.id);
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
            clientId,
          });
        }
      }

      updateDefaultEmulatorProfiles({
        defaultProfiles,
      });

      setOpen(false);
    },
    [updateDefaultEmulatorProfiles, setOpen, clientId],
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
        <form className="mb-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 *:pl-2">
            <Label>Platform Directory</Label>
            <Label>Default Profile</Label>
          </div>
          {defaults.map((field, index) => {
            const platform = platforms.find((p) => p.id === field.platformId);

            if (!platform) {
              return null;
            }

            const platformName =
              platform.metadata?.name ?? getFileStub(platform.path);

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

                  const validProfiles = emulatorProfiles.flatMap((profile) => {
                    const emulator = emulators.find(
                      (e) => e.id === profile.emulatorId,
                    );

                    if (!emulator?.supportedPlatforms.includes(platformId)) {
                      return [];
                    }

                    return [profile];
                  });

                  const unchanged =
                    currentDefaultProfile &&
                    currentDefaultProfile.emulatorProfileId ===
                      emulatorProfileId &&
                    !fieldState.isDirty;

                  const DisplayValue = () =>
                    emulatorForSelection && selectedProfile ? (
                      <div className="flex flex-col items-start">
                        <p className="font-semibold text-sm text-muted-foreground">
                          {emulatorForSelection?.name}
                        </p>
                        <p className={cn("font-medium text-foreground")}>
                          {selectedProfile?.name}
                          {unchanged ? (
                            <span className="text-sm text-muted-foreground/50">
                              {" "}
                              (current)
                            </span>
                          ) : (
                            ""
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        Select a profile...
                      </div>
                    );

                  return (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2 border-b py-1">
                          <div className="relative px-2 flex items-center">
                            <p>{platformName}</p>
                          </div>
                          <Popover modal={true}>
                            <PopoverTrigger
                              asChild
                              disabled={!validProfiles.length}
                            >
                              <Button
                                variant="ghost"
                                size="lg"
                                role="combobox"
                                className={cn("justify-between z-10 px-2")}
                              >
                                {validProfiles?.length ? (
                                  <DisplayValue />
                                ) : (
                                  <span className="text-muted-foreground">
                                    No valid profiles available
                                  </span>
                                )}

                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="p-0">
                              <Command>
                                <CommandInput placeholder="Search platforms..." />
                                <CommandList>
                                  {emulators.map((emulator) => {
                                    const profiles = validProfiles.filter(
                                      (p) => p.emulatorId === emulator.id,
                                    );

                                    if (!profiles.length) {
                                      return null;
                                    }

                                    return (
                                      <CommandGroup
                                        key={emulator.id}
                                        heading={emulator.name}
                                      >
                                        {profiles.map((profile) => {
                                          if (!emulator) {
                                            return null;
                                          }

                                          return (
                                            <CommandItem
                                              key={profile.id}
                                              value={profile.name}
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
                                                  field.value
                                                    .emulatorProfileId ===
                                                    profile.id
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                                )}
                                              />
                                              <div>
                                                {profile.name}
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
                                    );
                                  })}
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
        </form>
      </Form>

      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="secondary">Close</Button>
        </DialogClose>
        <Button onClick={form.handleSubmit(handleSubmit)}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}
