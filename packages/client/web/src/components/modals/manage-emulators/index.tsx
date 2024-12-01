import { useCallback, useEffect } from "react";
import { Route as RootRoute } from "@/routes/__root";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Check,
  ChevronsUpDown,
  Circle,
  InfoIcon,
  LoaderCircleIcon,
  TrashIcon,
} from "lucide-react";
import { cn, getFileStub } from "@/lib/utils";
import { useEmulators } from "@/queries/useEmulators";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { usePlatforms } from "@/queries/usePlatforms";
import { Platform } from "@/generated/retrom/models/platforms";
import {
  Emulator,
  NewEmulator,
  SaveStrategy,
  UpdatedEmulator,
} from "@/generated/retrom/models/emulators";
import { z } from "zod";
import { CreateEmulator } from "./create-emulator";
import { Button } from "@/components/ui/button";
import { useFieldArray, useForm } from "react-hook-form";
import { useUpdateEmulators } from "@/mutations/useUpdateEmulators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteEmulators } from "@/mutations/useDeleteEmulators";
import { PlatformMetadata } from "@/generated/retrom/models/metadata";
import { useNavigate } from "@tanstack/react-router";
import { useLocalEmulatorConfigs } from "@/queries/useLocalEmulatorConfigs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocalConfigs } from "./local-configs";

export type PlatformWithMetadata = Platform & { metadata?: PlatformMetadata };

export const saveStrategyDisplayMap: Record<SaveStrategy, string> = {
  [SaveStrategy.SINGLE_FILE]: "Single File",
  [SaveStrategy.FILE_SYSTEM_DIRECTORY]: "File System Directory",
  [SaveStrategy.DISK_IMAGE]: "Disk Image",
  [SaveStrategy.UNRECOGNIZED]: "Unrecognized",
};

export type EmulatorSchema = z.infer<typeof emulatorSchema>;
export const emulatorSchema = z.object({
  name: z
    .string()
    .min(1, "Emulator name must not be empty")
    .max(128, "Emulator name must not exceed 128 characters"),
  supportedPlatforms: z
    .array(z.number())
    .min(1, "Select at least one platform"),
  saveStrategy: z.nativeEnum(SaveStrategy, {
    message: "Select a save strategy",
  }),
}) satisfies z.ZodObject<
  Record<keyof Omit<NewEmulator, "createdAt" | "updatedAt">, z.ZodTypeAny>
>;

export type ChangesetSchema = z.infer<typeof changesetSchema>;
export const changesetSchema = z.object({
  emulators: z.array(
    z.object({
      id: z.number(),
      ...emulatorSchema.shape,
    }),
  ),
}) satisfies z.ZodObject<{
  emulators: z.ZodArray<
    z.ZodObject<
      Record<
        keyof Omit<UpdatedEmulator, "createdAt" | "updatedAt">,
        z.ZodTypeAny
      >
    >
  >;
}>;

export function ManageEmulatorsModal() {
  const navigate = useNavigate();
  const { manageEmulatorsModal } = RootRoute.useSearch();

  const { data: emulators, status: emulatorsStatus } = useEmulators({
    selectFn: (data) => data.emulators,
  });

  const { data: emulatorConfigs, status: emulatorConfigsStatus } =
    useLocalEmulatorConfigs({ selectFn: (data) => data.configs });

  const { data: platforms, status: platformsStatus } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) =>
      data.platforms
        .filter((platform) => !platform.thirdParty)
        .map((p) => ({
          ...p,
          metadata: data.metadata.find((m) => m.platformId === p.id),
        })),
  });

  const pending =
    emulatorsStatus === "pending" ||
    platformsStatus === "pending" ||
    emulatorConfigsStatus === "pending";

  const error =
    emulatorsStatus === "error" ||
    platformsStatus === "error" ||
    emulatorConfigsStatus === "error";

  return (
    <Dialog
      modal
      open={manageEmulatorsModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ search: { manageEmulatorsModal: undefined } });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Emulators</DialogTitle>
          <DialogDescription className="max-w-[70ch]">
            Manage existing emulator definitions and/or create new ones.
            Configure paths to your local emulators in the Configuration tab.
          </DialogDescription>
        </DialogHeader>

        {pending ? (
          <LoaderCircleIcon className="animate-spin h-8 w-8" />
        ) : error ? (
          <p className="text-red-500">
            An error occurred while fetching data. Please try again.
          </p>
        ) : (
          <Tabs defaultValue="emulators">
            <div className="w-full mb-6">
              <TabsList>
                <TabsTrigger value="emulators">All Emulators</TabsTrigger>
                <TabsTrigger value="local-configs">Configuration</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="emulators" className={cn("h-fit", "")}>
              <div
                className={cn(
                  "bg-muted text-muted-foreground p-2 rounded mt-2 mb-4",
                  "flex gap-2 text-sm",
                )}
              >
                <InfoIcon className="w-[1rem] h-[1rem] text-primary" />
                <p className="max-w-[60ch] text-pretty">
                  This is a list of all of the emulators that Retrom is
                  tracking. In order to use these emulators locally, you will
                  need to configure them in the Configuration tab.
                </p>
              </div>

              <EmulatorList platforms={platforms} emulators={emulators} />
            </TabsContent>

            <TabsContent value="local-configs">
              <LocalConfigs emulators={emulators} configs={emulatorConfigs} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmulatorList(props: {
  platforms: PlatformWithMetadata[];
  emulators: Emulator[];
}) {
  const { platforms, emulators } = props;

  const form = useForm<ChangesetSchema>({
    resolver: zodResolver(changesetSchema),
    mode: "all",
    defaultValues: {
      emulators,
    },
  });

  const { mutateAsync: updateEmulators, isPending: updatePending } =
    useUpdateEmulators();

  const handleSubmit = useCallback(
    async (values: ChangesetSchema) => {
      const emulators = values.emulators;

      updateEmulators({ emulators });
    },
    [updateEmulators],
  );

  const { isValidating, isDirty } = form.formState;

  const loading = isValidating || updatePending;
  const canSubmit = isDirty && !loading;

  useEffect(() => {
    form.reset({ emulators });
  }, [emulators, form]);

  const { fields: changesetItems } = useFieldArray({
    name: "emulators",
    control: form.control,
    keyName: "fieldId",
  });

  return (
    <>
      <main
        className={cn(
          "grid grid-cols-[10px_repeat(3,1fr)_min-content] pr-2 pb-4",
          "gap-y-2",
        )}
      >
        <div
          className={cn(
            "grid grid-cols-subgrid col-span-full",
            "text-sm font-bold pb-2 *:px-3",
          )}
        >
          <p></p>
          <p>Name</p>
          <p>Platforms</p>
          <p>Save Strategy</p>
          <p></p>
        </div>

        <CreateEmulator platforms={platforms} />
        <Form {...form}>
          <form
            className={cn(
              "grid grid-cols-subgrid col-span-full grid-flow-row auto-rows-max",
              "[&_*]:ring-inset gap-y-2",
            )}
          >
            {changesetItems.map((change, index) => {
              const isDirty = form.formState.dirtyFields.emulators?.at(index);

              return (
                <div
                  key={change.id}
                  className={cn(
                    !isDirty && "text-muted-foreground",
                    "grid grid-flow-col grid-cols-subgrid col-span-full border-b",
                    "items-center",
                  )}
                >
                  <Circle
                    className={cn(
                      isDirty ? "opacity-100" : "opacity-0",
                      "w-[8px] h-[8px] place-self-center fill-foreground text-foreground transition-colors",
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`emulators.${index}.name` as const}
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            className={cn(
                              error
                                ? "border-solid border-2 border-destructive"
                                : "border-none",
                            )}
                            placeholder="Enter emulator name"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`emulators.${index}.supportedPlatforms` as const}
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="ghost"
                                role="combobox"
                                className={cn(
                                  "justify-between w-full hover:bg-transparent",
                                  error &&
                                    "border-solid border-2 border-destructive",
                                  field.value.length === 0 &&
                                    "text-muted-foreground",
                                )}
                              >
                                {field.value.length
                                  ? `${field.value.length} platforms`
                                  : "Select platforms"}

                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent>
                            <PlatformsDropdown
                              selections={field.value}
                              platforms={platforms ?? []}
                              onChange={(id) => {
                                const value = [...field.value];
                                if (value.includes(id)) {
                                  value.splice(value.indexOf(id), 1);
                                } else {
                                  value.push(id);
                                }

                                field.onChange(value);
                              }}
                            />

                            <div className="flex justify-between gap-2 *:w-full">
                              <PopoverClose asChild>
                                <Button variant="secondary">Close</Button>
                              </PopoverClose>

                              <Button
                                onClick={() => {
                                  field.onChange([]);
                                }}
                              >
                                Clear
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`emulators.${index}.saveStrategy` as const}
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <Select
                          defaultValue={field.value?.toString()}
                          onValueChange={(value) => {
                            const valueNum = parseInt(value);
                            const saveStrategy = Object.values(
                              SaveStrategy,
                            ).find((v) => v === valueNum);

                            if (saveStrategy === undefined) return;

                            field.onChange(saveStrategy);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn(
                                "hover:bg-transparent",
                                error
                                  ? "border-solid border-2 border-destructive"
                                  : "border-none",
                              )}
                            >
                              <SelectValue placeholder="Select save strategy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(SaveStrategy)
                              .filter((value) => typeof value !== "string")
                              .filter(
                                (value) => value !== SaveStrategy.UNRECOGNIZED,
                              )
                              .map((value) => (
                                <SelectItem
                                  key={value}
                                  value={value.toString()}
                                >
                                  {saveStrategyDisplayMap[value]}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <DeleteButton emulator={change} />
                </div>
              );
            })}
          </form>
        </Form>
      </main>

      <DialogFooter className="border-none mt-8">
        <div className="flex justify-end col-span-4 gap-4">
          <DialogClose asChild>
            <Button variant="secondary" onClick={() => form.reset()}>
              Close
            </Button>
          </DialogClose>

          <Button
            className="relative"
            disabled={!canSubmit}
            onClick={form.handleSubmit(handleSubmit)}
          >
            <LoaderCircleIcon
              className={cn("animate-spin absolute", !loading && "opacity-0")}
            />
            <p className={cn(loading && "opacity-0")}>Update</p>
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function PlatformsDropdown(props: {
  platforms: PlatformWithMetadata[];
  onChange?: (id: number) => void;
  selections: number[];
}) {
  const { platforms, onChange, selections } = props;

  function sortBySelection(a: PlatformWithMetadata, b: PlatformWithMetadata) {
    const aSelected = selections.includes(a.id);
    const bSelected = selections.includes(b.id);
    const aName = a.metadata?.name ?? getFileStub(a.path) ?? "";
    const bName = b.metadata?.name ?? getFileStub(b.path) ?? "";

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    return aName.localeCompare(bName);
  }

  return (
    <Command>
      <CommandInput placeholder="Search platforms" />
      <CommandList>
        <CommandGroup>
          {platforms?.sort(sortBySelection).map((platform) => {
            const name = platform.metadata?.name ?? getFileStub(platform.path);

            return (
              <CommandItem
                className="cursor-pointer"
                key={platform.id}
                value={name}
                onSelect={() => onChange && onChange(platform.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selections.includes(platform.id)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {name}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function DeleteButton(props: { emulator: Emulator }) {
  const { emulator } = props;
  const { mutate: deleteEmulator, isPending } = useDeleteEmulators({
    key: emulator.id,
  });

  return (
    <Button
      size="icon"
      className="p-2 w-min h-min"
      variant="destructive"
      disabled={isPending}
      type="button"
      onClick={() => {
        deleteEmulator({ ids: [emulator.id] });
      }}
    >
      <TrashIcon
        className={cn("w-[1rem] h-[1rem]", isPending && "opacity-0")}
      />
      <LoaderCircleIcon
        className={cn(
          "animate-spin absolute",
          !isPending && "opacity-0",
          "w-[1rem] h-[1rem]",
        )}
      />
    </Button>
  );
}
