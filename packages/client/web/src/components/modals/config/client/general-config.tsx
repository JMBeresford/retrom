import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { checkIsDesktop } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/providers/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpenIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { migrateInstallationDir } from "retrom-plugin-installer-api";
import { z } from "zod";

type ConfigSchema = z.infer<typeof configSchema>;
const configSchema = z.object({
  interface: z.object({
    fullscreenByDefault: z.boolean(),
  }),
  installationDir: z.string().optional(),
});

export function GeneralConfig() {
  const navigate = useNavigate();
  const configStore = useConfigStore();
  const config = configStore((s) => s.config);
  const { toast } = useToast();

  const form = useForm<ConfigSchema>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      interface: {
        fullscreenByDefault: config?.interface?.fullscreenByDefault,
      },
      installationDir: config?.installationDir,
    },
  });

  const handleSubmit = useCallback(
    async (values: ConfigSchema) => {
      if (
        checkIsDesktop() &&
        values.installationDir &&
        values.installationDir !== config?.installationDir
      ) {
        try {
          await migrateInstallationDir(values.installationDir);
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
            ...values.interface,
          },
          installationDir: values.installationDir,
        };

        return s;
      });

      form.reset(values);
    },
    [configStore, form, config, toast],
  );

  const dirty = form.formState.isDirty;

  console.log({ dirty, formstate: form.formState });
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
            name="installationDir"
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
            name="interface.fullscreenByDefault"
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

          <DialogFooter>
            <Button
              onClick={() =>
                void navigate({
                  search: (prev) => ({ ...prev, configModal: undefined }),
                })
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
