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
import { ChevronsUpDown, LoaderCircleIcon, PlusCircleIcon } from "lucide-react";
import {
  emulatorSchema,
  EmulatorSchema,
  PlatformsDropdown,
  PlatformWithMetadata,
  saveStrategyDisplayMap,
} from ".";
import { useCallback } from "react";
import { SaveStrategy } from "@retrom/codegen/retrom/models/emulators_pb";

export function CreateEmulator(props: { platforms: PlatformWithMetadata[] }) {
  const { platforms } = props;
  const form = useForm<EmulatorSchema>({
    reValidateMode: "onChange",
    resolver: zodResolver(emulatorSchema),
    defaultValues: {
      name: "",
      supportedPlatforms: [],
      saveStrategy: undefined,
    },
  });

  const { mutateAsync: createEmulators, isPending: createEmulatorsPending } =
    useCreateEmulators();

  const onCreationFormSubmit = useCallback(
    async (values: EmulatorSchema) => {
      await createEmulators({
        emulators: [values],
      });

      form.reset();
    },
    [createEmulators, form],
  );

  const pending = createEmulatorsPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onCreationFormSubmit)}
        className={cn(
          "grid col-span-full grid-flow-col grid-cols-subgrid w-full",
          "[&_*]:ring-inset *:grid *:grid-rows-[auto_auto_1fr] *:grid-flow-row",
          "border-b items-center [&_*]:placeholder:opacity-50",
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
                      {field.value.length ? (
                        `${field.value.length} platforms`
                      ) : (
                        <span className="opacity-50">Select platforms</span>
                      )}

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
                  // Use type guard to ensure we're comparing numbers correctly
                  const numericValues = Object.values(SaveStrategy).filter(
                    (v): v is number => typeof v === "number"
                  );
                  const saveStrategy = numericValues.find(
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
                      field.value === undefined &&
                        "text-muted-foreground opacity-50",
                    )}
                  >
                    <SelectValue
                      placeholder="Select save strategy"
                      className="placeholder:opacity-50"
                    >
                      {field.value !== undefined
                        ? saveStrategyDisplayMap[field.value]
                        : null}
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

        <div>
          <Button
            type="submit"
            size="icon"
            className="p-2 w-min h-min"
            disabled={pending}
          >
            <LoaderCircleIcon
              className={cn(
                "animate-spin absolute",
                !pending && "opacity-0",
                "w-[1rem] h-[1rem]",
              )}
            />
            <PlusCircleIcon
              className={cn(pending && "opacity-0", "w-[1rem] h-[1rem]")}
            />
          </Button>
        </div>
      </form>
    </Form>
  );
}
