import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreateEmulators } from "@/mutations/useCreateEmulators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  ChevronsUpDown,
  FolderOpenIcon,
  LoaderCircleIcon,
  PlusCircleIcon,
} from "lucide-react";
import {
  emulatorSchema,
  EmulatorSchema,
  PlatformsDropdown,
  PlatformWithMetadata,
  saveStrategyDisplayMap,
} from ".";
import { useCallback } from "react";
import { SaveStrategy } from "@/generated/retrom/models/emulators";
import { useConfig } from "@/providers/config";
import { open } from "@tauri-apps/plugin-dialog";

export function CreateEmulator(props: { platforms: PlatformWithMetadata[] }) {
  const { platforms } = props;
  const configStore = useConfig();
  const clientId = configStore((store) => store.config.clientInfo.id);
  const form = useForm<EmulatorSchema>({
    reValidateMode: "onChange",
    resolver: zodResolver(emulatorSchema),
    defaultValues: {
      name: "",
      supportedPlatforms: [],
      saveStrategy: undefined,
      executablePath: "",
      clientId,
    },
  });

  const { mutate: createEmulators, isPending: creationPending } =
    useCreateEmulators();

  const onCreationFormSubmit = useCallback(
    (values: EmulatorSchema) => {
      const emulator = { ...values, clientId };
      createEmulators({
        emulators: [emulator],
      });

      form.reset();
    },
    [createEmulators, form, clientId],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onCreationFormSubmit)}
        className={cn(
          "grid col-span-6 grid-flow-col grid-cols-subgrid w-full",
          "[&_*]:ring-inset *:grid *:grid-rows-[auto_auto_1fr] *:grid-flow-row",
          "*:space-y-0 [&_label]:p-2 *:border-b pb-1 border-b",
        )}
      >
        <div></div>
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter emulator name"
                  className={cn(
                    error
                      ? "border-solid border-2 border-destructive"
                      : "border-none",
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supportedPlatforms"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between w-full border-l-0 font-normal hover:bg-transparent",
                        error
                          ? "border-solid border-2 border-destructive"
                          : "border-none",
                        field.value.length === 0 && "text-muted-foreground",
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
          name="saveStrategy"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <Select
                defaultValue={field.value?.toString() ?? ""}
                onValueChange={(value) => {
                  const valueNum = parseInt(value);
                  const saveStrategy = Object.values(SaveStrategy).find(
                    (v) => v === valueNum,
                  );

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
                      field.value === undefined && "text-muted-foreground",
                    )}
                  >
                    <SelectValue placeholder="Select save strategy">
                      {field.value !== undefined
                        ? saveStrategyDisplayMap[field.value]
                        : "Select save strategy"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SaveStrategy)
                    .filter(([_, value]) => value !== SaveStrategy.UNRECOGNIZED)
                    .map(([key, value]) => (
                      <SelectItem key={key} value={value.toString()}>
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
          name="executablePath"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center pl-3">
                  <Button
                    size="icon"
                    className="p-2 h-min w-min"
                    variant="secondary"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const result = await open({
                        title: "Select Emulator Executable",
                        multiple: false,
                        directory: false,
                      });

                      if (result) {
                        field.onChange(result);
                      }
                    }}
                  >
                    <FolderOpenIcon className="w-[1rem] h-[1rem]" />
                  </Button>
                  <Input
                    {...field}
                    placeholder="Enter path to executable"
                    className={cn(
                      error
                        ? "border-solid border-2 border-destructive"
                        : "border-none",
                    )}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={creationPending}
          >
            <LoaderCircleIcon
              className={cn(
                "animate-spin absolute",
                !creationPending && "opacity-0",
                "w-[1rem] h-[1rem]",
              )}
            />
            <PlusCircleIcon
              className={cn(
                creationPending && "opacity-0",
                "w-[1.2rem] h-[1.2rem] text-gray-300",
              )}
            />
          </Button>
        </div>
      </form>
    </Form>
  );
}
