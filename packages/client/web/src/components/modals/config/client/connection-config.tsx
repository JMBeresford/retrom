import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { RetromClientConfig_Server } from "@retrom/codegen/retrom/client/client-config";
import { cn } from "@/lib/utils";
import { useDisableStandaloneMode } from "@/mutations/useDisableStandaloneMode";
import { useEnableStandaloneMode } from "@/mutations/useEnableStandaloneMode";
import { useConfig, useConfigStore } from "@/providers/config";
import { useModalAction } from "@/providers/modal-action";
import { RetromClient } from "@/providers/retrom-client/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { clearInstallationDir } from "@retrom/plugin-installer";
import { z } from "zod";

export function ConnectionConfig() {
  const { openModal: confirm } = useModalAction("confirmModal");
  const serverConfig = useConfig((s) => s.server);
  const queryClient = useQueryClient();
  const { mutateAsync: enable, status: enableStatus } =
    useEnableStandaloneMode();
  const { toast } = useToast();
  const { mutateAsync: disable, status: disableStatus } =
    useDisableStandaloneMode();

  const pending = enableStatus === "pending" || disableStatus === "pending";

  const toggleStandaloneMode = useCallback(async () => {
    if (serverConfig?.standalone) {
      await disable(undefined);

      await queryClient.resetQueries();
    } else {
      confirm({
        title: "Are you sure?",
        description:
          "Disconnecting from a remote server will uninstall all currently installed games",
        onConfirm: async () => {
          await enable(undefined);

          try {
            await clearInstallationDir();
          } catch (error) {
            console.error(error);
            toast({
              title: "Failed to clear installation directory",
              variant: "destructive",
            });

            return;
          }

          await queryClient.resetQueries();
        },
      });
    }
  }, [disable, enable, serverConfig, confirm, toast, queryClient]);

  return (
    <TabsContent value="connection" className="relative">
      <div className={cn("flex flex-col gap-4")}>
        <div className="flex gap-2">
          <div className="flex items-top gap-2">
            <Checkbox
              id="toggle-standalone-mode"
              disabled={pending}
              checked={!!serverConfig?.standalone}
              onCheckedChange={toggleStandaloneMode}
            />
            <div className={cn("grid gap-1 leading-none")}>
              <label htmlFor="toggle-standalone-mode">Standalone Mode</label>

              <p className="text-sm text-muted-foreground">
                Use a local server for Retrom, instead of connecting to a remote
              </p>
            </div>
          </div>

          {pending ? (
            <div className="grid place-items-center">
              <LoaderCircle className="animate-spin text-primary h-full w-auto" />
            </div>
          ) : null}
        </div>

        <Separator />

        <div
          className={cn(
            "flex flex-col gap-4",
            pending && "pointer-events-none touch-none opacity-50",
          )}
        >
          <div className="max-w-[65ch]">
            {serverConfig?.standalone ? (
              <p>
                Standalone mode is activated! Other Retrom clients on this
                network can also access this server:
              </p>
            ) : (
              <p>
                Connect to a remote Retrom server by entering the hostname and
                port below:
              </p>
            )}
          </div>

          <ServerConnectionForm />
        </div>
      </div>
    </TabsContent>
  );
}

type ConfigShape = Record<
  Exclude<keyof RetromClientConfig_Server, "standalone">,
  z.ZodTypeAny
>;
const connectionSchema = z.object({
  hostname: z
    .string()
    .url("Must be a URL in the format: http(s)://some-hostname"),
  port: z.coerce.number().int().positive().or(z.literal("")),
}) satisfies z.ZodObject<ConfigShape>;

function ServerConnectionForm() {
  const { openModal: confirm } = useModalAction("confirmModal");
  const configStore = useConfigStore();
  const serverConfig = useConfig((s) => s.server);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync: testConnection, status } = useMutation({
    mutationFn: (values: z.infer<typeof connectionSchema>) => {
      const { hostname, port } = values;
      const host = new URL(hostname);
      host.port = String(port);

      const client = new RetromClient(host.toString());

      return client.serverClient.getServerInfo({});
    },
  });

  const form = useForm<z.infer<typeof connectionSchema>>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      hostname: serverConfig?.hostname ?? "",
      port: serverConfig?.port ?? "",
    },
    mode: "all",
  });

  const handleSubmit = useCallback(
    async (values: z.infer<typeof connectionSchema>) => {
      try {
        await testConnection(values);

        confirm({
          title: "Are you sure?",
          description:
            "Changing servers will uninstall all currently installed games",
          onConfirm: async () => {
            configStore.setState((prev) => {
              prev.server = {
                ...prev.server,
                hostname: values.hostname,
                port: values.port === "" ? undefined : values.port,
                standalone: false,
              };

              return { ...prev };
            });

            await queryClient.invalidateQueries();

            form.reset(values);

            try {
              await clearInstallationDir();
            } catch (error) {
              console.error(error);
              toast({
                title: "Failed to clear installation directory",
                variant: "destructive",
              });

              return;
            }
          },
          onCancel: () => form.reset(),
        });
      } catch (error) {
        console.error(error);
      }
    },
    [configStore, testConnection, form, confirm, toast, queryClient],
  );

  const isDirty = form.formState.isDirty;
  const canEdit = !serverConfig?.standalone && status !== "pending";
  const canSubmit =
    !serverConfig?.standalone &&
    (status === "success" || (status !== "pending" && isDirty));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid gap-2 grid-cols-[2fr,1fr]">
          {serverConfig?.standalone ? (
            <Input disabled value={serverConfig?.hostname} />
          ) : (
            <FormField
              name="hostname"
              disabled={!canEdit}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostname</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="on" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {serverConfig?.standalone ? (
            <Input
              type="number"
              disabled
              value={serverConfig?.port?.toString()}
            />
          ) : (
            <FormField
              name="port"
              disabled={!canEdit}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {status === "error" && (
          <FormMessage>
            Unable to connect to the server, please check the hostname and port
            and try again
          </FormMessage>
        )}

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>

          <Button
            type="submit"
            disabled={!canSubmit}
            className={cn("relative overflow-hidden")}
            variant={status === "error" ? "destructive" : "default"}
          >
            {status === "pending" ? (
              <LoaderCircle className="animate-spin" />
            ) : status === "error" ? (
              <span className="text-destructive-foreground">Try again</span>
            ) : (
              <>
                Save
                {status === "success" && (
                  <span
                    className={cn(
                      "absolute inset-0 bg-green-500 opacity-[1.5]",
                      "grid place-items-center text-white",
                      "delay-1000 duration-1000 animate-out fade-out fill-mode-forwards",
                    )}
                  >
                    <Check />
                  </span>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
