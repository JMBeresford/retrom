import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSetupModal } from "./context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useCallback, useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, LoaderCircleIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientInfo } from "@/queries/useClientInfo";
import { useConfigStore } from "@/providers/config";
import { Timestamp } from "@bufbuild/protobuf/wkt";

export function ClientName() {
  const { previousStep, nextStep } = useSetupModal();
  const clientInfo = useClientInfo();
  const configStore = useConfigStore();
  // const name = configStore((store) => store.config.clientInfo.name);
  const [newClient, setNewClient] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | undefined>(
    undefined,
  );

  const handleCreateClient = useCallback(() => {
    const clientExists = clientInfo.data?.clients.find(
      (client) => client.name === newClient,
    );

    if (newClient && nextStep && !clientExists) {
      configStore.setState((store) => {
        store.config = {
          ...store.config,
          clientInfo: {
            name: newClient,
            id: -1,
            createdAt: Timestamp.create(),
            updatedAt: Timestamp.create(),
          },
        };
        return store;
      });

      nextStep();
    }
  }, [newClient, nextStep, clientInfo.data?.clients, configStore]);

  const isExistingClient = useMemo(() => {
    return (
      clientInfo.data?.clients.find((client) => client.name === newClient) !==
      undefined
    );
  }, [clientInfo.data?.clients, newClient]);

  return (
    <div>
      <DialogHeader>
        <DialogTitle>What Should We Call You?</DialogTitle>
        <DialogDescription>
          Set a friendly name for this client
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div
          className={cn(
            "grid grid-flow-col grid-cols-[1fr_auto_1fr] gap-8",
            "[&_h3]:text-xl [&_h3]:font-bold [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:max-w-[35ch]",
          )}
        >
          <div className="space-y-4">
            <div>
              <h3>Setup New Client</h3>
              <p>
                Create a brand new client with a unique name and start fresh.
              </p>
            </div>

            <Input
              className={cn(isExistingClient && "border-destructive")}
              placeholder="Enter client name"
              value={newClient}
              onChange={({ target: { value } }) => setNewClient(value)}
            />

            {isExistingClient && (
              <h6 className="text-sm font-medium text-destructive-text max-w-[35ch]">
                Client name is taken, please choose another or use the existing
                client.
              </h6>
            )}

            <Button
              disabled={!newClient.length || isExistingClient}
              onClick={handleCreateClient}
            >
              Start Fresh
            </Button>
          </div>

          <div className="grid grid-rows-[1fr_auto_1fr] place-items-center gap-2">
            <Separator orientation="vertical" />
            <h5 className="text-lg font-bold">or</h5>
            <Separator orientation="vertical" />
          </div>

          <div className="space-y-4">
            <div>
              <TooltipProvider>
                <div className="flex gap-1">
                  <h3>Use Existing Client</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-[1rem] h-[1rem] ml-1 text-destructive-text" />
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col gap-2 max-w-[35ch] text-sm">
                      <span>
                        Certain settings and preferences will be synced if you
                        use the same client identifier on multiple devices.
                      </span>
                      <span>
                        Choose this option if you want to use emulators and
                        emulator profiles that you have already set up on
                        another device.
                      </span>
                      <span>
                        Note that if you want to sync this client w/ a client on
                        another device using this option, then that device must
                        have an identical file system structure as this one
                        (e.g. paths to emulator executables are the same) or you
                        will likely encounter breakages.
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p>
                  Identify an existing client by name and continue where you
                  left off.
                </p>
              </TooltipProvider>
            </div>

            <Select
              disabled={!clientInfo.data?.clients.length}
              value={selectedClient}
              onValueChange={(value) => setSelectedClient(value)}
            >
              <SelectTrigger>
                {clientInfo.isFetching ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : clientInfo.data?.clients.length ? (
                  <SelectValue placeholder="Select client" />
                ) : (
                  <SelectValue placeholder="No existing clients found" />
                )}
              </SelectTrigger>

              <SelectContent>
                {clientInfo.data?.clients.map((client) => (
                  <SelectItem key={client.id} value={client.name}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              disabled={
                !clientInfo.data?.clients.length || selectedClient === undefined
              }
              onClick={() => {
                configStore.setState((prev) => {
                  const client = clientInfo.data?.clients.find(
                    (client) => client.name === selectedClient,
                  );
                  if (selectedClient && client && prev.config) {
                    prev.config.clientInfo = {
                      name: client.name,
                      id: client.id,
                      createdAt: client.createdAt ?? Timestamp.create(),
                      updatedAt: client.updatedAt ?? Timestamp.create(),
                    };
                  }

                  return { ...prev };
                });

                if (nextStep) {
                  nextStep();
                }
              }}
            >
              We Are So Back
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        {previousStep && (
          <Button onClick={previousStep} variant="secondary">
            Back
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}
