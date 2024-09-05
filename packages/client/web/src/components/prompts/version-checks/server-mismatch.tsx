import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  useDialogOpen,
} from "@/components/ui/dialog";
import { useServerInfo } from "@/queries/useServerInfo";
import { Button } from "@/components/ui/button";
import { useClientVersion } from "@/queries/useClientVersion";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { versionCompare, versionToString } from "./utils";
import { Label } from "@/components/ui/label";
import { Code } from "@/components/ui/code";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";

export function ServerMismatch() {
  const { data: serverQuery, status: serverStatus } = useServerInfo();
  const { data: clientVersion, status: clientStatus } = useClientVersion();

  const pending = serverStatus === "pending" || clientStatus === "pending";
  const error = serverStatus === "error" || clientStatus === "error";

  if (pending || error || !serverQuery.serverInfo?.version || !clientVersion) {
    return null;
  }

  const serverVersion = serverQuery.serverInfo.version;

  const comparison = versionCompare(serverVersion, clientVersion);

  return (
    <Dialog defaultOpen={false}>
      {comparison !== 0 ? <InnerToast /> : null}
      <DialogContent className="max-w-[65ch]">
        <DialogHeader>
          <DialogTitle>Server Version Mismatch</DialogTitle>
          <DialogDescription>
            The server you are connecting to is running a different version of
            Retrom than the client you are using.
          </DialogDescription>
        </DialogHeader>

        <p>
          The server is running version{" "}
          <Code>{versionToString(serverVersion)}</Code>, but this client is
          running <Code>{versionToString(clientVersion)}</Code>. You may
          experience issues with Retrom until the version mismatch is resolved.
        </p>

        <Separator className="mt-4 mb-2" />

        <div>
          <Label>Learn more:</Label>
          <Button variant="link">
            <a href="#">updating the server</a>
          </Button>

          <Button variant="link">
            <a href="#">updating the client</a>
          </Button>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InnerToast() {
  const { toast } = useToast();
  const { setOpen } = useDialogOpen();

  useEffect(() => {
    const toastInfo = toast({
      title: "Server Version Mismatch",
      description: "The server is running a different version of Retrom.",
      action: (
        <ToastAction asChild altText="show version resolution dialog">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Resolve
          </Button>
        </ToastAction>
      ),
    });

    const dismiss = toastInfo.dismiss;

    return () => {
      if (dismiss) {
        dismiss();
      }
    };
  }, [toast, setOpen]);

  return <></>;
}
