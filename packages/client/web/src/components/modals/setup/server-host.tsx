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
import { useQuery } from "@tanstack/react-query";
import { RetromClient } from "@/providers/retrom-client/client";
import { cn } from "@/lib/utils";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useConfigStore } from "@/providers/config";

export function ServerHostStep() {
  const { previousStep } = useSetupModal();
  const initialState = useConfigStore().getState();
  const [hostname, setHostname] = useState(initialState.server.hostname);
  const [port, setPort] = useState(initialState.server.port?.toString() || "");

  return (
    <>
      <DialogHeader>
        <DialogTitle>Setup Retrom</DialogTitle>
        <DialogDescription>
          Let&apos;s configure your Retrom client
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 pb-4">
        <TooltipProvider>
          <Tooltip>
            <div className="flex gap-2 items-center">
              <h3>Server Host</h3>

              <TooltipTrigger>
                <InfoIcon className="w-[1rem] h-[1rem] text-muted-foreground" />
              </TooltipTrigger>
            </div>

            <div className="grid grid-cols-[400px_10ch_auto] grid-flow-col">
              <Input
                autoFocus={true}
                className="rounded-none rounded-l-md"
                placeholder="Hostname"
                value={hostname}
                onChange={({ target: { value } }) => setHostname(value.trim())}
              />

              <Input
                className="rounded-none rounded-r-md border-l-0"
                placeholder="Port"
                type="number"
                value={port}
                onChange={({ target: { value } }) => {
                  setPort(value.trim());
                }}
              />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              The hostname and port of the Retrom server you want to connect to.
            </p>

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
  const { hostname, port } = props;
  const { nextStep } = useSetupModal();
  const config = useConfigStore();

  const query = useQuery({
    enabled: false,
    queryKey: ["greeting", hostname, port],

    queryFn: async () => {
      const host = hostname + (port ? `:${port}` : "");
      const client = new RetromClient(host);
      return client.gameClient.getGames({ ids: [] });
    },
  });

  const testConnection = () =>
    query.refetch().then((res) => {
      if (!res.isSuccess || !nextStep) return;
      const portActual = port
        ? parseInt(port)
        : hostname.startsWith("https")
          ? 443
          : 80;

      config.setState({
        server: { hostname, port: portActual },
      });
      nextStep();
    });

  if (query.isFetching) {
    return (
      <Button className="flex gap-2 items-center" disabled>
        <LoaderCircleIcon className="animate-spin" /> Connecting...
      </Button>
    );
  }

  if (query.isError) {
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
