import { Button } from "@retrom/ui/components/button";
import { DialogClose, DialogFooter } from "@retrom/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@retrom/ui/components/form";
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
  InputGroupAddon,
} from "@retrom/ui/components/input-group";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retrom/ui/components/accordion";

type ConfigSchema = z.infer<typeof configSchema>;
const configSchema = z.object({
  executablePath: z.string().min(1, { message: "Executable path is required" }),
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
      <Accordion type="single" collapsible>
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
      </Accordion>

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

  console.log(emulator.id, { emulator, config });

  if (!clientId) {
    throw new Error("Client ID not found");
  }

  const form = useForm<ConfigSchema>({
    defaultValues: {
      executablePath: config?.executablePath || "",
      saveDataPath: config?.saveDataPath || "",
    } satisfies Required<ConfigSchema>,
    resolver: zodResolver(configSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
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
    <AccordionItem value={emulator.id.toString()}>
      <AccordionTrigger
        className={cn(
          "py-[0.35rem] px-1 hover:no-underline",
          "hover:bg-primary/15",
        )}
      >
        <span className="flex gap-2 items-baseline">
          <span>{emulator.name}</span>
          {isDirty ? (
            <span className="text-sm text-muted-foreground italic">
              (unsaved)
            </span>
          ) : null}
        </span>
      </AccordionTrigger>

      <AccordionContent className="[&_*]:ring-inset">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            name={emulator.id.toString()}
            className={cn("flex flex-col gap-4 pt-4 border-t")}
          >
            <FormField
              control={form.control}
              name="executablePath"
              render={({ field, fieldState: { isDirty } }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Executable Path</FormLabel>

                  <FormControl>
                    <InputGroup>
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
                          <FolderOpenIcon />
                          Browse
                        </InputGroupButton>
                      </InputGroupAddon>

                      <InputGroupInput
                        {...field}
                        value={field.value || ""}
                        placeholder="Enter path to executable"
                        className={cn(!isDirty && "text-muted-foreground")}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saveDataPath"
              render={({ field, fieldState: { isDirty } }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Save Data Path</FormLabel>

                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupButton
                          variant="secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            open({
                              title: "Select Save Data Directory",
                              directory: true,
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
                          <FolderOpenIcon />
                          Browse
                        </InputGroupButton>
                      </InputGroupAddon>

                      <InputGroupInput
                        {...field}
                        value={field.value || ""}
                        placeholder="Enter path save data location"
                        className={cn(!isDirty && "text-muted-foreground")}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={pending || !isDirty}
              type="submit"
              className="ml-auto w-min"
            >
              {pending ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <SaveIcon />
              )}
              Save
            </Button>
          </form>
        </Form>
      </AccordionContent>
    </AccordionItem>
  );
}
