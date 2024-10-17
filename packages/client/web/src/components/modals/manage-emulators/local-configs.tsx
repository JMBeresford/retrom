import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Emulator,
  LocalEmulatorConfig,
} from "@/generated/retrom/models/emulators";
import { cn } from "@/lib/utils";
import { useCreateLocalEmulatorConfigs } from "@/mutations/useCreateLocalEmulatorConfig";
import { useUpdateLocalEmulatorConfig } from "@/mutations/useUpdateLocalEmulatorConfigs";
import { useConfig } from "@/providers/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpenIcon, LoaderCircleIcon, SaveIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ConfigSchema = z.infer<typeof configSchema>;
const configSchema = z.object({
  executablePath: z.string().min(1),
}) satisfies z.ZodObject<
  Record<
    keyof Omit<
      LocalEmulatorConfig,
      "createdAt" | "updatedAt" | "id" | "emulatorId" | "clientId" | "nickname"
    >,
    z.ZodType
  >
>;

export function LocalConfigs(props: {
  emulators: Emulator[];
  configs: LocalEmulatorConfig[];
}) {
  return (
    <>
      <div className="grid grid-cols-[1fr_2fr_auto] grid-flow-col gap-y-2">
        <div
          className={cn(
            "grid grid-cols-subgrid col-span-full grid-flow-col",
            "text-sm *:font-bold",
          )}
        >
          <Label>Emulator</Label>
          <Label>Executable Path</Label>
        </div>

        {props.emulators.map((emulator) => {
          const config = props.configs.find(
            (c) => c.emulatorId === emulator.id,
          );

          return (
            <LocalConfigRow
              key={emulator.id}
              emulator={emulator}
              config={config}
            />
          );
        })}
      </div>

      <DialogFooter className="border-none mt-8">
        <div className="flex justify-end col-span-4 gap-4">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </>
  );
}

function LocalConfigRow(props: {
  emulator: Emulator;
  config?: LocalEmulatorConfig;
}) {
  const { emulator, config } = props;
  const clientId = useConfig().getState().config.clientInfo.id;

  const form = useForm<ConfigSchema>({
    defaultValues: {
      executablePath: config?.executablePath || "",
    } satisfies Required<ConfigSchema>,
    resolver: zodResolver(configSchema),
  });

  const { mutateAsync: createConfig, isPending: creationPending } =
    useCreateLocalEmulatorConfigs();

  const { mutateAsync: updateConfig, isPending: updatePending } =
    useUpdateLocalEmulatorConfig();

  const handleSubmit = useCallback(
    async (values: ConfigSchema) => {
      if (config) {
        const res = await updateConfig({
          configs: [
            { ...values, id: config.id, clientId, emulatorId: emulator.id },
          ],
        });
        form.reset(res.configsUpdated.at(0));
        return;
      } else {
        const res = await createConfig({
          configs: [{ ...values, clientId, emulatorId: emulator.id }],
        });
        form.reset(res.configsCreated.at(0));
        return;
      }
    },
    [config, createConfig, updateConfig, form, emulator, clientId],
  );

  const pending = creationPending || updatePending;
  const { isDirty } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        key={emulator.id}
        className={cn(
          "grid grid-cols-subgrid col-span-full",
          "items-center border-b",
        )}
      >
        <p className="text-muted-foreground text-sm">{emulator.name}</p>

        <FormField
          control={form.control}
          name="executablePath"
          render={({ field, fieldState: { isDirty } }) => (
            <FormItem>
              <div className="flex items-center">
                <Button
                  size="icon"
                  className="p-2 h-min w-min"
                  variant="secondary"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    try {
                      const result = await open({
                        title: "Select Emulator Executable",
                        multiple: false,
                        directory: false,
                      });

                      if (result) {
                        field.onChange(result);
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  <FolderOpenIcon className="w-[1rem] h-[1rem]" />
                </Button>

                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Enter path to executable"
                    className={cn(
                      "border-none",
                      !isDirty && "text-muted-foreground",
                    )}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <Button
          disabled={pending || !isDirty}
          type="submit"
          size="icon"
          onClick={() => console.log(form.formState)}
          className="p-2 w-min h-min"
        >
          {pending ? (
            <LoaderCircleIcon className="w-[1rem] h-[1rem] animate-spin" />
          ) : (
            <SaveIcon className="w-[1rem] h-[1rem]" />
          )}
        </Button>
      </form>
    </Form>
  );
}
