import { Button } from "@/components/ui/button";
import { Code } from "@/components/ui/code";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Version } from "@retrom/codegen/retrom/server/server-info";
import { cn } from "@/lib/utils";
import {
  isBreakingChange,
  versionCompare,
  versionToString,
} from "@/lib/version-utils";
import { useClientVersion } from "@/queries/useClientVersion";
import { useServerInfo } from "@/queries/useServerInfo";
import { Route } from "@/routes/__root";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";

export function VersionInfoModal() {
  const { versionInfoModal } = Route.useSearch();
  const navigate = useNavigate();
  const { data: serverVersion, status: serverStatus } = useServerInfo({
    selectFn: (data) => data.serverInfo?.version,
  });

  const { data: clientVersion, status: clientStatus } = useClientVersion();

  const pending = serverStatus === "pending" || clientStatus === "pending";
  const error = serverStatus === "error" || clientStatus === "error";

  function Content() {
    if (pending) {
      return (
        <>
          <DefaultHeader />

          <div className="grid place-items-center h-16">
            <LoaderCircleIcon className={"animate-spin"} />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </>
      );
    }

    if (error || !serverVersion || !clientVersion) {
      return (
        <>
          <DefaultHeader />

          <div className="text-destructive-text h-16 grid place-items-center">
            An error occurred while fetching version information.
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </>
      );
    }

    return (
      <>
        <Header clientVersion={clientVersion} serverVersion={serverVersion} />

        <Body clientVersion={clientVersion} serverVersion={serverVersion} />

        <Separator className="mt-4" />

        <div className="flex flex-col gap-2 sm:block text-center">
          <Label>Learn more:</Label>
          <div className="sm:contents">
            <Button variant="link" className="text-accent-text">
              <a
                target="_blank"
                href="https://github.com/JMBeresford/retrom/wiki/Updating#updating-the-server"
              >
                updating the server
              </a>
            </Button>

            <Button variant="link" className="text-accent-text">
              <a
                target="_blank"
                href="https://github.com/JMBeresford/retrom/wiki/Updating#updating-the-client"
              >
                updating the client
              </a>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </>
    );
  }

  return (
    <Dialog
      open={versionInfoModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            search: (prev) => ({ ...prev, versionInfoModal: undefined }),
          });
        }
      }}
    >
      <DialogContent className="max-w-[65ch]">
        <Content />
      </DialogContent>
    </Dialog>
  );
}

function DefaultHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Version Information</DialogTitle>
      <DialogDescription>
        This is the version that Retrom is currently running.
      </DialogDescription>
    </DialogHeader>
  );
}

function Header(props: { serverVersion: Version; clientVersion: Version }) {
  const { clientVersion, serverVersion } = props;

  const comparison = versionCompare(serverVersion, clientVersion);
  const breakingChange = isBreakingChange(serverVersion, clientVersion);

  if (comparison === 0) {
    return <DefaultHeader />;
  }

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
}

function Body(props: { serverVersion: Version; clientVersion: Version }) {
  const { serverVersion, clientVersion } = props;

  const comparison = versionCompare(serverVersion, clientVersion);
  const breakingChange = isBreakingChange(serverVersion, clientVersion);

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
          <strong>These versions are not compatible.</strong> Please resolve the
          version mismatch before continuing.
        </p>
      </div>
    );
  }

  if (comparison !== 0) {
    return (
      <div>
        <Common />

        <p>
          You may experience issues with Retrom until the version mismatch is
          resolved.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Common />

      <p>
        The server and client are running the same version of Retrom. No further
        action is required.
      </p>
    </div>
  );
}
