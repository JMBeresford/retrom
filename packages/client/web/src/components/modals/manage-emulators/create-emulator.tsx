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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { emulatorSchema, EmulatorSchema, PlatformWithMetadata } from ".";
import { useCallback } from "react";
import {
  Emulator,
  SaveStrategy,
} from "@retrom/codegen/retrom/models/emulators_pb";
import { useCreateEmulators } from "@/mutations/useCreateEmulators";
import { saveStrategyDisplayMap } from "./utils";

export function CreateEmulator(props: {
  platforms: PlatformWithMetadata[];
  onSuccess: (emu: Emulator) => void;
}) {
  const { onSuccess } = props;
  const form = useForm<EmulatorSchema>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(emulatorSchema),
    defaultValues: {
      name: "",
      supportedPlatforms: [],
      saveStrategy: undefined,
      operatingSystems: [],
    },
  });

  const { mutateAsync: createEmulators, isPending: creationPending } =
    useCreateEmulators();

  const handleSubmit = useCallback(
    async (values: EmulatorSchema) => {
      try {
        const { emulatorsCreated } = await createEmulators({
          emulators: [values],
        });

        form.reset({
          name: "",
          supportedPlatforms: [],
          saveStrategy: undefined,
          operatingSystems: [],
        });

        onSuccess(emulatorsCreated[0]);
      } catch (error) {
        console.error(error);
      }
    },
    [form, onSuccess, createEmulators],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex gap-2 mb-4")}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter emulator name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="saveStrategy"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Save Strategy</FormLabel>
              <Select
                defaultValue={field.value?.toString() ?? ""}
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                }}
              >
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      field.value === undefined && "text-muted-foreground",
                    )}
                  >
                    <SelectValue placeholder="Select save strategy..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(SaveStrategy)
                    .filter((type) => typeof type === "number")
                    .map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {saveStrategyDisplayMap[value]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel
            htmlFor="create-emulator-submit"
            className="text-transparent select-none"
          >
            Submit
          </FormLabel>

          <Button
            id="create-emulator-submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={!form.formState.isValid || creationPending}
            className={cn("flex gap-2 items-center")}
          >
            <PlusIcon className="w-[1rem]" /> Add Emulator
          </Button>
        </div>
      </form>
    </Form>
  );
}
