import { Input } from "@/components/ui/input";
import { useSetupModal } from "./context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { InfoIcon, LoaderCircleIcon, XCircleIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { RetromClient } from "@/providers/retrom-client/client";
import { cn } from "@/lib/utils";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useState } from "react";
import { useConfigStore } from "@/providers/config";
import { Label } from "@/components/ui/label";

export function ServerHostStep() {
  const { previousStep } = useSetupModal();
  const initialState = useConfigStore().getState();
  const [hostname, setHostname] = useState(initialState.server?.hostname ?? "");
  const [port, setPort] = useState(initialState.server?.port?.toString() ?? "");

  return (
    <>
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
            <div className="grid grid-cols-[400px_10ch_auto] grid-flow-col">
              <div>
                <div className="flex gap-2 items-center mb-2">
                  <Label htmlFor="hostname">Server Hostname</Label>
                </div>

                <Input
                  id="hostname"
                  autoFocus={true}
                  className="rounded-none rounded-l-md ring-inset"
                  placeholder="Enter hostname..."
                  value={hostname}
                  onChange={({ target: { value } }) =>
                    setHostname(value.trim())
                  }
                />
              </div>

              <div>
                <Label htmlFor="port" className="flex gap-2 items-center mb-2">
                  Port
                  <TooltipTrigger>
                    <InfoIcon className="w-[0.875rem] h-[0.875rem] text-muted-foreground" />
                  </TooltipTrigger>
                </Label>

                <Input
                  id="port"
                  className="rounded-none rounded-r-md border-l-0 ring-inset"
                  type="number"
                  value={port}
                  onChange={({ target: { value } }) => {
                    setPort(value.trim());
                  }}
                />
              </div>
            </div>

            <TooltipContent>
              <div className="flex flex-col gap-2 text-sm max-w-[60ch]">
                <p>
                  If you are hosting the server at a domain (e.g.
                  https://my-retrom-domain.com), then you can leave the port
                  empty and it will be inferred based on the protocol used.
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

        <TestButton hostname={hostname} port={port} />
      </DialogFooter>
    </>
  );
}

function TestButton(props: { hostname: string; port?: string }) {
  const { nextStep } = useSetupModal();
  const config = useConfigStore();

  const { mutateAsync: checkServer, status } = useMutation({
    mutationFn: (vars: { hostname: string; port?: string }) => {
      const { hostname, port } = vars;

      const host = new URL(hostname);
      if (port) {
        host.port = port;
      }

      const client = new RetromClient(host.toString());

      return client.serverClient.getServerInfo({});
    },
  });

  const testConnection = useCallback(async () => {
    try {
      const { hostname, port } = props;
      await checkServer({ hostname, port });

      const portActual = port
        ? parseInt(port)
        : hostname.startsWith("https")
          ? 443
          : 80;

      config.setState({
        server: { hostname, port: portActual, standalone: false },
      });

      if (nextStep) {
        nextStep();
      }
    } catch (error) {
      console.error(error);
    }
  }, [checkServer, config, nextStep, props]);

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
    <Button className={cn("ml-2")} onClick={testConnection}>
      Next
    </Button>
  );
}
