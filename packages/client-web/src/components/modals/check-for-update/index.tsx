import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { useUpdateCheck } from "@/queries/useUpdateCheck";
import { useClientVersion } from "@/queries/useClientVersion";
import { Code } from "@/components/ui/code";
import {
  Changelog,
  isBreakingChange,
  parseVersion,
  versionToString,
} from "@/lib/version-utils";
import { Progress } from "@/components/ui/progress";
import { relaunch } from "@tauri-apps/plugin-process";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { Route as RootRoute } from "@/routes/__root";
import { useNavigate } from "@tanstack/react-router";
import { Version } from "@retrom/codegen/retrom/server/server-info_pb";
import { Update } from "@tauri-apps/plugin-updater";
import { Separator } from "@/components/ui/separator";

type Progress = {
  downloaded: number;
  total: number | undefined;
  done: boolean;
};

export function CheckForUpdateModal() {
  const navigate = useNavigate();
  const { checkForUpdateModal } = RootRoute.useSearch();
  const { data: update, status: updateCheckStatus } = useUpdateCheck();
  const { data: clientVersion, status: clientVersionStatus } =
    useClientVersion();

  const pending =
    updateCheckStatus === "pending" || clientVersionStatus === "pending";

  return (
    <Dialog
      open={checkForUpdateModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            to: ".",
            search: (prev) => ({ ...prev, checkForUpdateModal: undefined }),
          });
        }
      }}
    >
      <DialogContent className="max-w-[65ch]">
        <DialogHeader>
          <DialogTitle>Update Retrom</DialogTitle>
          <DialogDescription>
            Update Retrom to the latest version
          </DialogDescription>
        </DialogHeader>

        {pending ? (
          <>
            <div className="flex items-center justify-center gap-2 h-16 text-muted-foreground">
              <LoaderCircleIcon className="animate-spin" />
              Checking for updates...
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>

              <Button disabled>Update</Button>
            </DialogFooter>
          </>
        ) : clientVersion ? (
          <InnerContent
            clientVersion={clientVersion}
            update={update ?? undefined}
          />
        ) : (
          <></>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InnerContent(props: { clientVersion: Version; update?: Update }) {
  const { clientVersion, update } = props;

  const newVersion = parseVersion(update?.version);
  const breakingChange = isBreakingChange(newVersion, clientVersion);
  const [progress, setProgress] = useState<Progress | undefined>(undefined);

  const handleUpdate = useCallback(() => {
    if (!update?.available) {
      return;
    }

    setProgress({
      downloaded: 0,
      total: undefined,
      done: false,
    });

    void update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Progress": {
          setProgress((prev) => {
            if (!prev) return undefined;

            const { downloaded } = prev;

            return {
              ...prev,
              downloaded: downloaded + event.data.chunkLength,
            };
          });
          break;
        }

        case "Finished":
          {
            setProgress((prev) => {
              if (!prev) return undefined;

              return {
                ...prev,
                done: true,
              };
            });
          }

          break;
      }
    });
  }, [update, setProgress]);

  const Content = () =>
    newVersion && update ? (
      <>
        <h3>
          A new version of Retrom is available:{" "}
          <Code>{`${versionToString(clientVersion)} -> ${versionToString(newVersion)}`}</Code>
        </h3>

        <Separator />
        <Changelog update={update} />
      </>
    ) : (
      <div className="h-16 grid place-items-center">
        <h3 className="test-2xl text-muted-foreground">No updates available</h3>
      </div>
    );

  return (
    <>
      <Content />

      {breakingChange ? (
        <>
          <Separator />
          <div className="flex gap-2 my-2">
            <AlertCircle className="text-destructive-text" />
            <p>
              This is a breaking change. Please ensure your server is also
              up-to-date once you update the client or you will encounter
              issues.
            </p>
          </div>
        </>
      ) : (
        <></>
      )}

      <DialogFooter>
        {progress === undefined ? (
          <>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>

            <Button disabled={!update?.version} onClick={handleUpdate}>
              Update
            </Button>
          </>
        ) : progress.done ? (
          <>
            <Button variant="secondary">Restart Later</Button>
            <Button onClick={relaunch}>Restart</Button>
          </>
        ) : (
          <>
            <Button disabled variant="secondary">
              Close
            </Button>
            <Button disabled>
              <LoaderCircleIcon className="animate-spin" />
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  );
}
