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
import { isBreakingChange, versionCompare, versionToString } from "./utils";
import { Label } from "@/components/ui/label";
import { Code } from "@/components/ui/code";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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
  const breakingChange = isBreakingChange(serverVersion, clientVersion);

  const Header = () => {
    if (breakingChange) {
      return (
        <DialogHeader>
          <DialogTitle>Incompatible Server Version</DialogTitle>

          <DialogDescription>
            The server you are connecting to is running a version of Retrom that
            is not compatible with this client. You may experience issues until
            the version mismatch is resolved.
          </DialogDescription>
        </DialogHeader>
      );
    }

    return (
      <DialogHeader>
        <DialogTitle>Server Version Mismatch</DialogTitle>
        <DialogDescription>
          The server you are connecting to is running a different version of
          Retrom than the client you are using.
        </DialogDescription>
      </DialogHeader>
    );
  };

  const Body = () => {
    const Common = () => (
      <div
        className={cn(
          "flex gap-2 justify-around [&_h3]:font-black",
          "my-6 py-4 text-center rounded-md border",
        )}
      >
        <div>
          <h3>Server Version</h3>
          <Code>{versionToString(serverVersion)}</Code>
        </div>

        <div>
          <h3>Client Version</h3>
          <Code>{versionToString(clientVersion)}</Code>
        </div>
      </div>
    );

    if (breakingChange) {
      return (
        <div>
          <Common />

          <p>
            <strong>These versions are not compatible.</strong> Please resolve
            the version mismatch before continuing.
          </p>
        </div>
      );
    }

    return (
      <div>
        <Common />

        <p>
          You may experience issues with Retrom until the version mismatch is
          resolved.
        </p>
      </div>
    );
  };

  return (
    <Dialog defaultOpen={false}>
      {comparison !== 0 ? <InnerToast breaking={breakingChange} /> : null}
      <DialogContent className="max-w-[65ch]">
        <Header />

        <Body />

        <Separator className="mt-4" />

        <div>
          <Label>Learn more:</Label>
          <Button variant="link">
            <a
              target="_blank"
              href="https://github.com/JMBeresford/retrom/blob/main/docs/updating/README.md#updating-the-server"
            >
              updating the server
            </a>
          </Button>

          <Button variant="link">
            <a
              target="_blank"
              href="https://github.com/JMBeresford/retrom/blob/main/docs/updating/README.md#updating-the-client"
            >
              updating the client
            </a>
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

function InnerToast(props: { breaking: boolean }) {
  const { toast } = useToast();
  const { setOpen } = useDialogOpen();

  useEffect(() => {
    const title = props.breaking
      ? "Incompatible Server Version"
      : "Server Version Mismatch";

    const variant = props.breaking ? "destructive" : "default";

    const description = props.breaking
      ? "You may experience issues until the version mismatch is resolved."
      : "The server is running a different version of Retrom.";

    const toastInfo = toast({
      title,
      variant,
      description,
      duration: Infinity,
      action: (
        <ToastAction
          altText="show version resolution dialog"
          onClick={() => setOpen(true)}
        >
          Resolve
        </ToastAction>
      ),
    });

    const dismiss = toastInfo.dismiss;

    return () => {
      if (dismiss) {
        dismiss();
      }
    };
  }, [toast, setOpen, props.breaking]);

  return <></>;
}
