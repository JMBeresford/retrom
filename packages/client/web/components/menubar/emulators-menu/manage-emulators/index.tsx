"use client";

import { useCallback, useEffect, useState } from "react";
import { MenubarItem } from "@/components/ui/menubar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import {
  Check,
  ChevronsUpDown,
  LoaderCircleIcon,
  XCircleIcon,
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
  RomType,
  UpdatedEmulator,
} from "@/generated/retrom/models/emulators";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { CreateEmulator } from "./create-emulator";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export type PlatformWithMetadata = Platform & { metadata?: PlatformMetadata };

export const romTypeDisplayMap: Record<RomType, string> = {
  [RomType.Custom]: "Custom",
  [RomType.MultiFile]: "Multi-file",
  [RomType.SingleFile]: "Single-file",
  [RomType.UNRECOGNIZED]: "Unknown",
};

export type EmulatorSchema = z.infer<typeof emulatorSchema>;
export const emulatorSchema = z.object({
  name: z.string().min(1).max(128),
  supportedPlatforms: z.array(z.number()).min(1),
  romType: z.nativeEnum(RomType),
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

export function ManageEmulatorsMenuItem() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: emulators, status: emulatorsStatus } = useEmulators({
    selectFn: (data) => data.emulators,
  });

  const { data: platforms, status: platformsStatus } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) =>
      data.platforms.map((p) => ({
        ...p,
        metadata: data.metadata.find((m) => m.platformId === p.id),
      })),
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          Manage Emulators
        </MenubarItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Emulators</DialogTitle>
          <DialogDescription>
            Manage existing emulator configurations and/or create new ones.
          </DialogDescription>
        </DialogHeader>

        <Separator className="mb-4" />

        {emulatorsStatus === "pending" || platformsStatus === "pending" ? (
          <LoaderCircleIcon className="animate-spin h-8 w-8" />
        ) : emulatorsStatus === "error" || platformsStatus === "error" ? (
          <p className="text-red-500">
            An error occurred while fetching data. Please try again.
          </p>
        ) : (
          <EmulatorList platforms={platforms} emulators={emulators} />
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
    mode: "onBlur",
    defaultValues: {
      emulators,
    },
  });

  const { mutate: updateEmulators, isPending: updatePending } =
    useUpdateEmulators();

  const handleSubmit = useCallback(
    (values: ChangesetSchema) => {
      updateEmulators(values);
    },
    [updateEmulators],
  );

  const formState = form.formState;
  const loading = formState?.isValidating || updatePending;
  const canSubmit = formState?.isValid && formState?.isDirty && !loading;

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
      <ScrollArea className="h-[60vh]">
        <main className="grid grid-cols-[1fr_1fr_1fr_min-content] pr-2 pb-4">
          <div
            className={cn(
              "grid grid-cols-subgrid col-span-4",
              "text-sm font-bold border-b pb-2 pl-2",
            )}
          >
            <p>Name</p>
            <p>Platforms</p>
            <p>Rom Type</p>
            <p></p>
          </div>

          <CreateEmulator platforms={platforms} />
          <Form {...form}>
            <form
              className={cn(
                "grid grid-cols-subgrid col-span-4 grid-flow-row auto-rows-max",
                "*:grid *:grid-flow-col *:grid-cols-subgrid *:col-span-4",
                "*:border-b [&_*]:ring-inset",
              )}
            >
              {changesetItems.map((change, index) => {
                const isDirty = form.formState.dirtyFields.emulators?.[index];

                return (
                  <div
                    key={change.id}
                    className={cn(!isDirty && "text-muted-foreground")}
                  >
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
                                    "justify-between w-full",
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
                      name={`emulators.${index}.romType` as const}
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <Select
                            defaultValue={field.value?.toString()}
                            onValueChange={(value) => {
                              const valueNum = parseInt(value);
                              const romType = Object.values(RomType).find(
                                (v) => v === valueNum,
                              );

                              if (romType === undefined) return;

                              field.onChange(romType);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  error
                                    ? "border-solid border-2 border-destructive"
                                    : "border-none",
                                )}
                              >
                                <SelectValue placeholder="Select rom type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(RomType)
                                .filter((value) => typeof value !== "string")
                                .filter(
                                  (value) => value !== RomType.UNRECOGNIZED,
                                )
                                .map((value) => (
                                  <SelectItem
                                    key={value}
                                    value={value.toString()}
                                  >
                                    {romTypeDisplayMap[value]}
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
      </ScrollArea>

      <DialogFooter className="border-none mt-8">
        <div className="flex justify-end col-span-4 gap-4">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
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

  return (
    <Command>
      <CommandInput placeholder="Search platforms" />
      <CommandList>
        <CommandGroup>
          {platforms?.map((platform) => (
            <CommandItem
              className="cursor-pointer"
              key={platform.id}
              value={platform.id.toString()}
              onSelect={(value) => onChange && onChange(parseInt(value))}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selections.includes(platform.id)
                    ? "opacity-100"
                    : "opacity-0",
                )}
              />
              {platform.metadata?.name ?? getFileStub(platform.path)}
            </CommandItem>
          ))}
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
      className="text-destructive-text"
      variant="ghost"
      disabled={isPending}
      type="button"
      onClick={() => {
        deleteEmulator({ ids: [emulator.id] });
      }}
    >
      <XCircleIcon
        className={cn("w-[1.2rem] h-[1.2rem]", isPending && "opacity-0")}
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
