import { useCallback } from "react";
import { DialogClose, DialogFooter } from "../../ui/dialog";
import {
  Check,
  ChevronsUpDown,
  LoaderCircleIcon,
  TrashIcon,
  X,
} from "lucide-react";
import { cn, getFileStub } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Emulator,
  Emulator_OperatingSystem,
  SaveStrategy,
} from "@retrom/codegen/retrom/models/emulators_pb";
import { CreateEmulator } from "./create-emulator";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useUpdateEmulators } from "@/mutations/useUpdateEmulators";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useModalAction } from "@/providers/modal-action";
import { useToast } from "@/components/ui/use-toast";
import { changesetSchema, ChangesetSchema, PlatformWithMetadata } from ".";
import {
  operatingSystemDisplayMap,
  PlatformsDropdown,
  saveStrategyDisplayMap,
} from "./utils";
import { ConnectError } from "@connectrpc/connect";

export function EmulatorList(props: {
  platforms: PlatformWithMetadata[];
  emulators: Emulator[];
}) {
  const { platforms, emulators } = props;
  const { openModal: confirm } = useModalAction("confirmModal");
  const { toast } = useToast();

  const { mutateAsync: updateEmulators, isPending } = useUpdateEmulators();
  const { mutateAsync: deleteEmulators, isPending: deletionPending } =
    useDeleteEmulators();

  const form = useForm<ChangesetSchema>({
    resolver: zodResolver(changesetSchema),
    defaultValues:
      changesetSchema.safeParse({
        emulators: emulators.reduce(
          (acc, val) => ({ ...acc, [`${val.id}`]: val }),
          {},
        ),
      }).data ?? {},
    mode: "all",
  });

  const handleSubmit = useCallback(
    async (values: ChangesetSchema) => {
      try {
        const { emulatorsUpdated: emulators } = await updateEmulators({
          emulators: Object.values(values.emulators),
        });

        form.reset({
          emulators: emulators.reduce(
            (acc, val) => ({ ...acc, [`${val.id}`]: val }),
            {},
          ),
        });
      } catch (e) {
        console.error(e);
        const description =
          e instanceof ConnectError ? e.message : "An error occurred";

        toast({
          title: "Failed to update emulators",
          description,
          variant: "destructive",
        });
      }
    },
    [updateEmulators, form, toast],
  );

  const pending = isPending || deletionPending;
  const changeset = form.watch("emulators");

  return (
    <>
      <CreateEmulator
        platforms={platforms}
        onSuccess={(emulator) => {
          form.register(`emulators.${emulator.id}`, {
            value: emulator,
          });
        }}
      />
      <Form {...form}>
        <form>
          <Accordion type="single" collapsible>
            {Object.values(changeset)
              .sort((a, b) => a.name.localeCompare(b.name))
              .sort((a, b) => Number(a.builtIn) - Number(b.builtIn))
              .map((emulator) => {
                return (
                  <FormField
                    key={emulator.id}
                    control={form.control}
                    name={`emulators.${emulator.id}`}
                    render={({ fieldState }) => {
                      const { isDirty, invalid } = fieldState;

                      const builtIn = emulators.find(
                        (e) => e.id === emulator.id,
                      )?.builtIn;

                      return (
                        <AccordionItem
                          value={emulator.id.toString()}
                          key={emulator.id}
                        >
                          <AccordionTrigger
                            className={cn(
                              "py-[0.35rem] px-1 hover:no-underline",
                              "hover:bg-primary/15",
                            )}
                          >
                            <span className="flex gap-2 items-baseline">
                              <span
                                className={cn(invalid && "text-destructive")}
                              >
                                {emulator.name}
                              </span>
                              {builtIn ? (
                                <Badge variant="outline">Built In</Badge>
                              ) : null}
                              {isDirty ? (
                                <span className="text-sm text-muted-foreground italic">
                                  (unsaved)
                                </span>
                              ) : null}
                            </span>
                          </AccordionTrigger>

                          <AccordionContent
                            className={cn(
                              "flex flex-col gap-2 pt-4 border-t",
                              "[&_*]:ring-inset",
                            )}
                          >
                            <FormField
                              control={form.control}
                              name={`emulators.${emulator.id}.name` as const}
                              disabled={builtIn}
                              render={({ field }) => (
                                <FormItem className="flex flex-col items-start">
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter emulator name"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={
                                `emulators.${emulator.id}.supportedPlatforms` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <Popover modal={true}>
                                    <FormLabel>Supported Platforms</FormLabel>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                            "justify-between w-full",
                                            field.value.length === 0 &&
                                              "text-muted-foreground",
                                          )}
                                        >
                                          {field.value.length ? (
                                            <span className="flex gap-1">
                                              {field.value.map((v) => {
                                                const platform = platforms.find(
                                                  (p) => p.id === v,
                                                );

                                                if (!platform) return null;

                                                const name =
                                                  platform.metadata?.name ??
                                                  getFileStub(platform.path);

                                                return (
                                                  <Badge
                                                    key={v}
                                                    variant="secondary"
                                                    className="flex items-center gap-1"
                                                  >
                                                    {name}
                                                    <X
                                                      className="w-[0.8rem] h-fit p-0 hover:text-destructive"
                                                      onClick={(e) => {
                                                        e.stopPropagation();

                                                        field.onChange(
                                                          field.value.filter(
                                                            (id) => id !== v,
                                                          ),
                                                        );
                                                      }}
                                                    />
                                                  </Badge>
                                                );
                                              })}
                                            </span>
                                          ) : (
                                            "Select platforms..."
                                          )}

                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <FormMessage />

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

                                          field.onChange(value.sort());
                                        }}
                                      />

                                      <div className="flex justify-between gap-2 *:w-full">
                                        <PopoverClose asChild>
                                          <Button variant="secondary">
                                            Close
                                          </Button>
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
                              name={
                                `emulators.${emulator.id}.saveStrategy` as const
                              }
                              disabled={builtIn}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Save Strategy</FormLabel>
                                  <Select
                                    defaultValue={field.value?.toString()}
                                    onValueChange={(value) => {
                                      const valueNum = parseInt(value);
                                      const saveStrategy = Object.values(
                                        SaveStrategy,
                                      ).find((v) => v.valueOf() === valueNum);

                                      if (saveStrategy === undefined) return;

                                      field.onChange(saveStrategy);
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        disabled={field.disabled}
                                        className={cn(
                                          field.disabled &&
                                            "hover:bg-transparent",
                                        )}
                                      >
                                        <SelectValue placeholder="Select save strategy..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Object.values(SaveStrategy)
                                        .filter(
                                          (value) => typeof value !== "string",
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

                            <FormField
                              control={form.control}
                              disabled={builtIn}
                              name={
                                `emulators.${emulator.id}.operatingSystems` as const
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <Popover>
                                    <FormLabel>Operating Systems</FormLabel>
                                    <FormControl>
                                      <PopoverTrigger asChild>
                                        <Button
                                          disabled={field.disabled}
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                            "justify-between w-full",
                                            field.disabled &&
                                              "hover:bg-transparent",
                                            field.value.length === 0 &&
                                              "text-muted-foreground",
                                          )}
                                        >
                                          {field.value.length ? (
                                            <span className="flex gap-1">
                                              {field.value.map((v) => (
                                                <Badge
                                                  key={v}
                                                  variant="secondary"
                                                  className="flex items-center gap-1"
                                                >
                                                  {operatingSystemDisplayMap[v]}
                                                  <X
                                                    className="w-[0.8rem] h-fit p-0 hover:text-destructive"
                                                    onClick={(e) => {
                                                      e.stopPropagation();

                                                      field.onChange(
                                                        field.value.filter(
                                                          (id) => id !== v,
                                                        ),
                                                      );
                                                    }}
                                                  />
                                                </Badge>
                                              ))}
                                            </span>
                                          ) : (
                                            "Select Operating Systems..."
                                          )}

                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                    </FormControl>

                                    <PopoverContent>
                                      <Command>
                                        <CommandInput placeholder="Search operating systems" />
                                        <CommandList>
                                          <CommandGroup>
                                            {Object.values(
                                              Emulator_OperatingSystem,
                                            )
                                              .filter(
                                                (value) =>
                                                  typeof value !== "string",
                                              )
                                              .filter(
                                                (value) =>
                                                  value !==
                                                    Emulator_OperatingSystem.WASM ||
                                                  builtIn,
                                              )
                                              .map((os) => (
                                                <CommandItem
                                                  key={os}
                                                  value={os.toString()}
                                                  onSelect={() => {
                                                    const value = [
                                                      ...field.value,
                                                    ];
                                                    if (value.includes(os)) {
                                                      value.splice(
                                                        value.indexOf(os),
                                                        1,
                                                      );
                                                    } else {
                                                      value.push(os);
                                                    }

                                                    field.onChange(value);
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      field.value.includes(os)
                                                        ? "opacity-100"
                                                        : "opacity-0",
                                                    )}
                                                  />
                                                  {
                                                    operatingSystemDisplayMap[
                                                      os
                                                    ]
                                                  }
                                                </CommandItem>
                                              ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end my-4">
                              <Button
                                type="button"
                                variant="destructive"
                                disabled={
                                  builtIn ||
                                  deletionPending ||
                                  emulator.id === undefined
                                }
                                className="flex gap-2"
                                onClick={() => {
                                  const description = `Are you sure you want to delete ${emulator.name}?`;

                                  confirm({
                                    title: `Delete Emulator`,
                                    description,
                                    onConfirm: async () => {
                                      if (emulator.id === undefined) {
                                        return;
                                      }

                                      await deleteEmulators({
                                        ids: [emulator.id],
                                      });

                                      form.unregister(
                                        `emulators.${emulator.id}`,
                                      );
                                    },
                                  });
                                }}
                              >
                                <TrashIcon className="w-[1.0rem]" /> Delete
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }}
                  />
                );
              })}
          </Accordion>
        </form>
      </Form>

      <DialogFooter className="border-none mt-8">
        <div className="flex justify-end col-span-4 gap-4">
          <DialogClose asChild>
            <Button variant="secondary" onClick={() => form.reset()}>
              Close
            </Button>
          </DialogClose>

          <Button
            className="relative"
            disabled={pending || !form.formState.isValid}
            onClick={form.handleSubmit(handleSubmit)}
          >
            <LoaderCircleIcon
              className={cn("animate-spin absolute", !pending && "opacity-0")}
            />
            <p className={cn(pending && "opacity-0")}>Update</p>
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
