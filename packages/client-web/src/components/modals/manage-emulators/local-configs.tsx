import { Button } from "@retrom/ui/components/button";
import { DialogClose, DialogFooter } from "@retrom/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@retrom/ui/components/form";
import { Label } from "@retrom/ui/components/label";
import {
  Emulator,
  LocalEmulatorConfig,
  LocalEmulatorConfigJson,
} from "@retrom/codegen/retrom/models/emulators_pb";
import { cn } from "@retrom/ui/lib/utils";
import { useCreateLocalEmulatorConfigs } from "@/mutations/useCreateLocalEmulatorConfig";
import { useUpdateLocalEmulatorConfig } from "@/mutations/useUpdateLocalEmulatorConfigs";
import { useConfigStore } from "@/providers/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpenIcon, LoaderCircleIcon, SaveIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "@retrom/ui/components/form";
import { z } from "zod";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@retrom/ui/components/input-group";

type ConfigSchema = z.infer<typeof configSchema>;
const configSchema = z.object({
  executablePath: z.string().min(1),
  saveDataPath: z.string().optional(),
}) satisfies z.ZodObject<
  Record<
    keyof Omit<
      LocalEmulatorConfigJson,
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

        {props.emulators
          .filter((e) => !e.builtIn)
          .map((emulator) => {
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
  const clientId = useConfigStore().getState().config?.clientInfo?.id;

  if (!clientId) {
    throw new Error("Client ID not found");
  }

  const form = useForm<ConfigSchema>({
    defaultValues: {
      executablePath: config?.executablePath || "",
      saveDataPath: config?.saveDataPath || "",
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
  const { isDirty: formDirty } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        key={emulator.id}
        className={cn(
          "grid grid-cols-subgrid col-span-full",
          "items-center border-b pb-2",
        )}
      >
        <p className="text-muted-foreground text-sm">{emulator.name}</p>

        <div className="flex items-center gap-2 w-full">
          <FormField
            control={form.control}
            name="executablePath"
            render={({ field, fieldState: { isDirty } }) => (
              <FormItem className="w-full">
                <InputGroup>
                  <FormControl>
                    <InputGroupInput
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter path to executable"
                      className={cn(
                        "border-none",
                        !isDirty && "text-muted-foreground",
                      )}
                    />
                  </FormControl>

                  <InputGroupAddon align="inline-start">
                    <InputGroupButton
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        open({
                          title: "Select Emulator Executable",
                          multiple: false,
                          directory: false,
                        })
                          .then((result) => {
                            if (result) {
                              field.onChange(result);
                            }
                          })
                          .catch((e) => {
                            console.error(e);
                          });
                      }}
                    >
                      <FolderOpenIcon className="w-[1rem] h-[1rem]" />
                      Browse
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </FormItem>
            )}
          />

          <Button disabled={pending || !formDirty} type="submit">
            {pending ? (
              <LoaderCircleIcon className="w-[1rem] h-[1rem] animate-spin" />
            ) : (
              <>
                <SaveIcon className="w-[1rem] h-[1rem]" />
                Save
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
