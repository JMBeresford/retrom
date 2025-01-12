import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSetupModal } from "./context";
import { Button } from "@/components/ui/button";
import { useCreateClient } from "@/mutations/useCreateClient";
import { useCallback } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useClientInfo } from "@/queries/useClientInfo";
import { useConfigStore } from "@/providers/config";
import { Timestamp } from "@/generated/google/protobuf/timestamp";
import { useQueryClient } from "@tanstack/react-query";

export function Confirm() {
  const { toast } = useToast();
  const { previousStep, nextStep } = useSetupModal();
  const { mutateAsync: createClient, status } = useCreateClient();
  const configStore = useConfigStore();
  const name = configStore((store) => store.config?.clientInfo?.name);
  const clientInfo = useClientInfo();
  const queryClient = useQueryClient();

  const save = useCallback(async () => {
    try {
      let client;

      if (
        name &&
        !clientInfo.data?.clients.find((client) => client.name === name)
      ) {
        const res = await createClient({
          name,
        });

        client = res.clientCreated;
      } else {
        client = clientInfo.data?.clients.find(
          (client) => client.name === name,
        );
      }

      configStore.setState((prev) => {
        if (client) {
          prev.config = {
            ...prev.config,
            clientInfo: {
              id: client.id,
              name: client.name,
              createdAt: client.createdAt ?? Timestamp.create(),
              updatedAt: client.updatedAt ?? Timestamp.create(),
            },
          };
        }

        prev.flowCompletions = {
          ...prev.flowCompletions,
          setupComplete: true,
        };

        return { ...prev };
      });

      void queryClient.resetQueries();

      if (nextStep) {
        nextStep();
      }
    } catch {
      toast({
        title: "Failed to save config",
        description:
          "Failed to save the configuration. Please try again. If the problem persists, please report this as an issue.",
        variant: "destructive",
      });
    }
  }, [
    queryClient,
    createClient,
    configStore,
    toast,
    clientInfo.data?.clients,
    nextStep,
    name,
  ]);

  const pending = status === "pending";
  const error = status === "error";

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Job&apos;s Done</DialogTitle>
        <DialogDescription>That wasn&apos;t so hard, was it?</DialogDescription>
      </DialogHeader>

      <div className="max-w-[45ch] flex flex-col gap-2">
        <p>You have successfully configured your Retrom client! 🎉</p>

        <p>
          Click next to save your changes and start using Retrom! Or, you can go
          back and make more changes.
        </p>
      </div>

      <DialogFooter>
        {previousStep && (
          <Button onClick={previousStep} variant="secondary">
            Back
          </Button>
        )}

        {pending ? (
          <Button disabled>
            <LoaderCircleIcon className="w-[1rem] h-[1rem] animate-spin" />
          </Button>
        ) : error ? (
          <Button onClick={save} variant="destructive">
            Save and Relaunch
          </Button>
        ) : (
          <Button onClick={save}>Save</Button>
        )}
      </DialogFooter>
    </div>
  );
}
