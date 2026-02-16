import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { useSetupModal } from "./context";
import { Button } from "@retrom/ui/components/button";
import { cn } from "@retrom/ui/lib/utils";
import { AlertCircle, Cloud, LoaderCircle, Server } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@retrom/ui/components/tooltip";
import { useEnableStandaloneMode } from "@/mutations/useEnableStandaloneMode";
import { useDisableStandaloneMode } from "@/mutations/useDisableStandaloneMode";
import { useIsFlatpak } from "@/queries/useIsFlatpak";
import { Spinner } from "@retrom/ui/components/spinner";
import { useEffect } from "react";

export function ModeSelection() {
  const { setStep, step } = useSetupModal();
  const isFlatpakQuery = useIsFlatpak();

  const { mutateAsync: enableStandaloneMode, status: enableStatus } =
    useEnableStandaloneMode();

  const { mutateAsync: disableStandaloneMode, status: disableStatus } =
    useDisableStandaloneMode();

  const pending = enableStatus === "pending" || disableStatus === "pending";

  useEffect(() => {
    if (isFlatpakQuery.data && step === "Mode") {
      disableStandaloneMode(undefined)
        .then(() => setStep("ServerHost"))
        .catch(console.error);
    }
  }, [disableStandaloneMode, isFlatpakQuery.data, setStep, step]);

  return isFlatpakQuery.status === "pending" ? (
    <div className="grid place-items-center w-full h-32">
      <Spinner /> Please wait...
    </div>
  ) : (
    <>
      <DialogHeader>
        <DialogTitle>Use Standalone Mode?</DialogTitle>
        <DialogDescription className="max-w-[65ch]">
          Retrom uses a server to synchronize your data across devices. Retrom
          can handle this server for you on this device, or you can connect to
          an existing server.
        </DialogDescription>
      </DialogHeader>

      <div
        className={cn(
          "flex flex-col w-full gap-4 mt-6",
          "*:w-full *:justify-start *:gap-2 *:h-auto *:max-h-none",
        )}
      >
        <Button
          onClick={() => {
            enableStandaloneMode(undefined)
              .then(() => setStep("ClientName"))
              .catch(console.error);
          }}
          variant="outline"
          disabled={pending}
          className={cn(enableStatus === "error" && "border-destructive")}
        >
          <Server className="text-accent-text" />

          <div className="flex flex-col justify-start w-full">
            <h1 className="text-regular font-semibold w-fit">
              Use Standalone Mode
            </h1>
            <p className="text-muted-foreground text-sm w-fit">
              Retrom will spin up a server locally
            </p>
          </div>

          {enableStatus === "pending" && (
            <LoaderCircle className="animate-spin" />
          )}
          {enableStatus === "error" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="text-destructive-text" />
                </TooltipTrigger>

                <TooltipContent>
                  Something went wrong, please restart and try again
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Button>

        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            disableStandaloneMode(undefined)
              .then(() => setStep("ServerHost"))
              .catch(console.error);
          }}
        >
          <Cloud className="text-accent-text" />

          <div className="flex flex-col justify-start w-full">
            <h1 className="text-regular font-semibold w-fit">
              Connect To Server
            </h1>
            <p className="text-muted-foreground text-sm w-fit">
              Connect to an existing Retrom server
            </p>
          </div>

          {disableStatus === "pending" && (
            <LoaderCircle className="animate-spin" />
          )}
          {disableStatus === "error" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="text-destructive-text" />
                </TooltipTrigger>

                <TooltipContent>
                  Something went wrong, please restart and try again
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Button>
      </div>
    </>
  );
}
