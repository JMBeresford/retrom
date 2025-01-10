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
import { RetromClientConfig_Server } from "@/generated/retrom/client/client-config";
import { cn } from "@/lib/utils";
import { useDisableStandaloneMode } from "@/mutations/useDisableStandaloneMode";
import { useEnableStandaloneMode } from "@/mutations/useEnableStandaloneMode";
import { useConfig, useConfigStore } from "@/providers/config";
import { RetromClient } from "@/providers/retrom-client/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function ConnectionConfig() {
  const serverConfig = useConfig((s) => s.server);
  const { mutate: enable, status: enableStatus } = useEnableStandaloneMode();
  const { mutate: disable, status: disableStatus } = useDisableStandaloneMode();
  const queryClient = useQueryClient();

  const pending = enableStatus === "pending" || disableStatus === "pending";

  const toggleStandaloneMode = useCallback(() => {
    if (serverConfig?.standalone) {
      disable(undefined);
    } else {
      enable(undefined);
      void queryClient.resetQueries();
    }
  }, [disable, enable, serverConfig, queryClient]);

  return (
    <TabsContent value="connection" className="relative">
      {pending ? (
        <div className="grid place-items-center">
          <LoaderCircle size={80} className="animate-spin text-primary" />
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-4",
            pending && "pointer-events-none touch-none opacity-25",
          )}
        >
          <div className="flex items-top gap-2">
            <Checkbox
              id="toggle-standalone-mode"
              checked={serverConfig?.standalone}
              onCheckedChange={toggleStandaloneMode}
            />
            <div className={cn("grid gap-1 leading-none")}>
              <label htmlFor="toggle-standalone-mode">Standalone Mode</label>

              <p className="text-sm text-muted-foreground">
                Use a local server for Retrom, instead of connecting to a remote
              </p>
            </div>
          </div>

          <Separator />

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
      )}
    </TabsContent>
  );
}

type ConfigShape = Record<
  Exclude<keyof RetromClientConfig_Server, "standalone">,
  z.ZodTypeAny
>;
const connectionSchema = z.object({
  hostname: z.string().url(),
  port: z.coerce.number().int().positive(),
}) satisfies z.ZodObject<ConfigShape>;

function ServerConnectionForm() {
  const configStore = useConfigStore();
  const serverConfig = useConfig((s) => s.server);

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
      hostname: serverConfig?.hostname ?? "http://localhost",
      port: serverConfig?.port,
    },
    mode: "all",
  });

  const handleSubmit = useCallback(
    async (values: z.infer<typeof connectionSchema>) => {
      try {
        await testConnection(values);

        configStore.setState((prev) => {
          prev.server = {
            ...prev.server,
            hostname: values.hostname,
            port: values.port,
          };

          return { ...prev };
        });

        form.reset(values);
      } catch (error) {
        console.error(error);
      }
    },
    [configStore, testConnection, form],
  );

  const isDirty = form.formState.isDirty;
  const canEdit = !serverConfig?.standalone && status !== "pending";
  const canSubmit =
    !serverConfig?.standalone &&
    (status === "success" || (status !== "pending" && isDirty));

  return (
    <Form {...form}>
      <form onSubmit={() => void form.handleSubmit(handleSubmit)()}>
        <div className="grid gap-2 grid-cols-[2fr,1fr]">
          <FormField
            name="hostname"
            disabled={!canEdit}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hostname</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

        {status === "error" && (
          <FormMessage>
            Unable to connect to the server, please check the hostname and port
            and try again
          </FormMessage>
        )}

        <DialogFooter>
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
