import { Input } from "@retrom/ui/components/input";
import { useSetupModal } from "./context";
import { Button } from "@retrom/ui/components/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@retrom/ui/components/tooltip";
import { InfoIcon, LoaderCircleIcon, XCircleIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { RetromClient } from "@/providers/retrom-client/client";
import { cn } from "@retrom/ui/lib/utils";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { useCallback } from "react";
import { useConfigStore } from "@/providers/config";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  useFormContext,
} from "@retrom/ui/components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code } from "@retrom/ui/components/code";

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  hostname: z
    .string()
    .url({ message: "Must be in the form: http(s)://ipaddress-or-domain" }),
  port: z.coerce.number().optional(),
});
export function ServerHostStep() {
  const { previousStep } = useSetupModal();
  const initialState = useConfigStore().getState();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    mode: "all",
    defaultValues: {
      hostname: initialState.server?.hostname ?? "http://localhost",
      port: initialState.server?.port ?? 5101,
    },
  });

  return (
    <Form {...form}>
      <DialogHeader>
        <DialogTitle>Connect to Retrom Server</DialogTitle>
        <DialogDescription>
          Enter the hostname and port of the Retrom server you want to connect
          to.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <TooltipProvider>
          <Tooltip>
            <form className="grid grid-cols-[400px_15ch] grid-rows-1 grid-flow-col">
              <FormField
                control={form.control}
                name="hostname"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Server Hostname</FormLabel>
                      <FormControl>
                        <Input
                          autoFocus={true}
                          className="rounded-none rounded-l-md ring-inset"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Port
                      <TooltipTrigger type="button">
                        <InfoIcon className="ml-1 w-[0.875rem] h-[0.875rem]" />
                      </TooltipTrigger>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="rounded-none rounded-r-md border-l-0 ring-inset"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>

            <TooltipContent>
              <div className="flex flex-col gap-2 text-sm max-w-[60ch]">
                <p>
                  The default server port is 5101, however if you are hosting
                  the server at a domain (e.g.{" "}
                  <Code className="text-xs">https://my-retrom-domain.com</Code>
                  ), then you can leave the port empty and it will be inferred
                  based on the protocol used:
                </p>

                <p>
                  <Code className="text-xs">http</Code> will default to port 80
                </p>
                <p>
                  <Code className="text-xs">https</Code> will default to port
                  443
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <DialogFooter>
        {previousStep && (
          <Button onClick={previousStep} variant="secondary">
            Back
          </Button>
        )}

        <TestButton />
      </DialogFooter>
    </Form>
  );
}

function TestButton() {
  const { nextStep } = useSetupModal();
  const { getValues, formState } = useFormContext<FormSchema>();
  const config = useConfigStore();

  const { mutateAsync: checkServer, status } = useMutation({
    mutationFn: (vars: { hostname: string; port?: string | number }) => {
      const { hostname, port } = vars;

      const host = new URL(hostname);
      if (port) {
        host.port = port.toString();
      }

      const client = new RetromClient(host.toString());

      return client.serverClient.getServerInfo({});
    },
  });

  const testConnection = useCallback(async () => {
    try {
      const { hostname, port } = getValues();
      await checkServer({ hostname, port });

      const portActual = port ? port : hostname.startsWith("https") ? 443 : 80;

      config.setState({
        server: { hostname, port: portActual, standalone: false },
      });

      if (nextStep) {
        nextStep();
      }
    } catch (error) {
      console.error(error);
    }
  }, [checkServer, config, nextStep, getValues]);

  if (status === "pending") {
    return (
      <Button className="flex gap-2 items-center" disabled>
        <LoaderCircleIcon className="animate-spin" /> Connecting...
      </Button>
    );
  }

  if (status === "error") {
    return (
      <Button
        className="flex gap-2 items-center"
        variant="destructive"
        onClick={testConnection}
      >
        <XCircleIcon className="w-[1rem] h-[1rem]" /> Try Again
      </Button>
    );
  }

  return (
    <Button
      className={cn("ml-2")}
      onClick={testConnection}
      disabled={!formState.isValid}
    >
      Next
    </Button>
  );
}
