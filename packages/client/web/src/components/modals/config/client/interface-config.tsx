import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/providers/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ConfigSchema = z.infer<typeof configSchema>;
const configSchema = z.object({
  fullscreenByDefault: z.boolean(),
});

export function InterfaceConfig() {
  const navigate = useNavigate();
  const configStore = useConfigStore();
  const config = configStore((s) => s.config);

  const form = useForm<ConfigSchema>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      fullscreenByDefault: config?.interface?.fullscreenByDefault,
    },
  });

  const handleSubmit = useCallback(
    (values: ConfigSchema) => {
      configStore.setState((s) => {
        s.config = {
          ...s.config,
          interface: {
            ...s.config?.interface,
            fullscreenByDefault: values.fullscreenByDefault,
          },
        };

        return s;
      });

      form.reset(values);
    },
    [configStore, form],
  );

  const dirty = form.formState.isDirty;
  return (
    <TabsContent value="interface" className="mt-4">
      <Form {...form}>
        <form onSubmit={void form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="fullscreenByDefault"
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

            <Button type="submit" disabled={!dirty}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </TabsContent>
  );
}
