import { Button } from "@retrom/ui/components/button";
import { Checkbox } from "@retrom/ui/components/checkbox";
import { DialogFooter } from "@retrom/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@retrom/ui/components/form";
import { Input } from "@retrom/ui/components/input";
import { TabsContent } from "@retrom/ui/components/tabs";
import { useToast } from "@retrom/ui/hooks/use-toast";
import { checkIsDesktop } from "@/lib/env";
import { InferSchema } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useConfigStore } from "@/providers/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpenIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "@retrom/ui/components/form";
import { migrateInstallationDir } from "@retrom/plugin-installer";
import { z } from "zod";
import { RetromClientConfig } from "@retrom/codegen/retrom/client/client-config_pb";
import { RawMessage } from "@/utils/protos";

type ConfigSchema = z.infer<typeof configSchema>;
const configSchema = z.object({
  config: z.object({
    interface: z.object({
      fullscreenByDefault: z.boolean(),
      fullscreenConfig: z.object({
        windowedFullscreenMode: z.boolean().optional(),
      }),
    }),
    installationDir: z.string().optional(),
  }),
  telemetry: z.object({
    enabled: z.boolean(),
  }),
}) satisfies InferSchema<
  Pick<RawMessage<RetromClientConfig>, "config" | "telemetry">
>;

export function GeneralConfig() {
  const navigate = useNavigate();
  const configStore = useConfigStore();
  const { config, telemetry } = configStore();
  const { toast } = useToast();

  const form = useForm<ConfigSchema>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      config: {
        interface: {
          fullscreenByDefault: config?.interface?.fullscreenByDefault ?? false,
          fullscreenConfig: {
            ...config?.interface?.fullscreenConfig,
            windowedFullscreenMode:
              config?.interface?.fullscreenConfig?.windowedFullscreenMode ??
              !checkIsDesktop(),
          },
        },
        installationDir: config?.installationDir ?? "",
      },
      telemetry: {
        enabled: telemetry?.enabled ?? false,
      },
    },
  });

  const handleSubmit = useCallback(
    async (values: ConfigSchema) => {
      if (
        checkIsDesktop() &&
        values.config.installationDir &&
        values.config.installationDir !== config?.installationDir
      ) {
        try {
          await migrateInstallationDir(values.config.installationDir);
        } catch (e) {
          toast({
            title: "Failed to migrate installation directory",
            description:
              "An error occurred while migrating the installation directory. " +
              "Please check both the old and new directories to ensure your installations are not lost",
            variant: "destructive",
          });

          toast({
            title: "Failed to update config",
            description: String(e),
            variant: "destructive",
          });

          form.reset();
          return;
        }
      }

      configStore.setState((s) => {
        s.config = {
          ...s.config,
          interface: {
            ...s.config?.interface,
            ...values.config.interface,
          },
          installationDir: values.config.installationDir,
        };

        s.telemetry = {
          ...s.telemetry,
          enabled: values.telemetry.enabled,
        };

        return s;
      });

      form.reset(values);
    },
    [configStore, form, config, toast],
  );

  const dirty = form.formState.isDirty;

  return (
    <TabsContent value="general" className="mt-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FormField
            control={form.control}
            disabled={!checkIsDesktop()}
            name="config.installationDir"
            render={({ field, fieldState: { isDirty } }) => (
              <FormItem className={cn(!checkIsDesktop() && "hidden")}>
                <FormLabel>Installation Directory</FormLabel>

                <div className={cn("flex items-center gap-2")}>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      open({
                        title: "Select Installation Directory",
                        multiple: false,
                        directory: true,
                        defaultPath: field.value,
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
                  </Button>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      className={cn(!isDirty && "text-muted-foreground")}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.interface.fullscreenByDefault"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-top gap-2">
                    <Checkbox
                      id="fullscreen-by-default"
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(val)}
                    />
                    <div className={cn("grid gap-1 5 leading-none")}>
                      <label htmlFor="fullscreen-by-default">
                        Fullscreen by default
                      </label>

                      <p className="text-sm text-muted-foreground">
                        Enabling this will make Retrom launch in fullscreen mode
                        by default
                      </p>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.interface.fullscreenConfig.windowedFullscreenMode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-top gap-2">
                    <Checkbox
                      id="fullscreen-by-default"
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(val)}
                    />
                    <div className={cn("grid gap-1 5 leading-none")}>
                      <label htmlFor="fullscreen-by-default">
                        Windowed fullscreen mode
                      </label>

                      <p className="text-sm text-muted-foreground max-w-[45ch]">
                        Enabling this will keep the application in a
                        non-fullscreen window even when using Fullscreen Mode
                      </p>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telemetry.enabled"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-top gap-2">
                    <Checkbox
                      id="telemetry-enabled"
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(val)}
                    />
                    <div className={cn("grid gap-1 5 leading-none")}>
                      <label htmlFor="telemetry-enabled">
                        Enable Telemetry
                        <span className="text-xs text-muted-foreground ml-1">
                          (requires restart)
                        </span>
                      </label>

                      <p className="text-sm text-muted-foreground max-w-[45ch]">
                        Send anonymous usage data such as performance metrics
                        and errors to help improve Retrom
                      </p>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <DialogFooter className="gap-2">
            <Button
              onClick={() =>
                navigate({
                  to: ".",
                  search: (prev) => ({ ...prev, configModal: undefined }),
                }).catch(console.error)
              }
              variant="secondary"
            >
              Close
            </Button>

            <Button onClick={form.handleSubmit(handleSubmit)} disabled={!dirty}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </TabsContent>
  );
}
