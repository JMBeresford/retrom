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
import { RomType } from "@/generated/retrom/models/emulators";
import { cn } from "@/lib/utils";
import { useCreateEmulators } from "@/mutations/useCreateEmulators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, LoaderIcon, PlusCircleIcon } from "lucide-react";
import {
  emulatorSchema,
  EmulatorSchema,
  PlatformsDropdown,
  PlatformWithMetadata,
  romTypeDisplayMap,
} from ".";
import { useCallback } from "react";

export function CreateEmulator(props: { platforms: PlatformWithMetadata[] }) {
  const { platforms } = props;
  const form = useForm<EmulatorSchema>({
    reValidateMode: "onChange",
    resolver: zodResolver(emulatorSchema),
    defaultValues: {
      name: "",
      supportedPlatforms: [],
      romType: undefined,
    },
  });

  const { mutate: createEmulators, isPending: creationPending } =
    useCreateEmulators();

  const onCreationFormSubmit = useCallback(
    (values: EmulatorSchema) => {
      createEmulators({ emulators: [values] });
      form.reset();
    },
    [createEmulators, form],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onCreationFormSubmit)}
        className={cn(
          "grid col-span-4 grid-flow-col grid-cols-subgrid w-full",
          "[&_*]:ring-inset *:grid *:grid-rows-[auto_auto_1fr] *:grid-flow-row",
          "*:space-y-0 [&_label]:p-2 *:border-b",
        )}
      >
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
                        "justify-between w-full border-l-0 font-normal",
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
          name="romType"
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
                      field.value === undefined && "text-muted-foreground",
                    )}
                  >
                    <SelectValue placeholder="Select rom type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(RomType)
                    .filter((value) => typeof value !== "string")
                    .filter((value) => value !== RomType.UNRECOGNIZED)
                    .map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {romTypeDisplayMap[value]}
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
            variant="ghost"
            disabled={creationPending}
          >
            <LoaderIcon
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
