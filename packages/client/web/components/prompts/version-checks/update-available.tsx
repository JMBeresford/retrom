"use client";

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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useState } from "react";
import { useUpdateCheck } from "@/queries/useUpdateCheck";
import { useClientVersion } from "@/queries/useClientVersion";
import { Code } from "@/components/ui/code";
import { versionToString } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { relaunch } from "@tauri-apps/plugin-process";

type Progress = {
  downloaded: number;
  total: number | undefined;
  done: boolean;
};

export function UpdateAvailable() {
  const { data: clientVersion } = useClientVersion();
  const { data: update } = useUpdateCheck();
  const [progress, setProgress] = useState<Progress>({
    downloaded: 0,
    total: undefined,
    done: false,
  });

  const handleUpdate = useCallback(async () => {
    if (!update) {
      return;
    }

    const { downloadAndInstall } = update;

    await downloadAndInstall((event) => {
      switch (event.event) {
        case "Started": {
          setProgress({
            downloaded: 0,
            total: event.data.contentLength,
            done: false,
          });
          break;
        }

        case "Progress": {
          setProgress((prev) => {
            const { downloaded } = prev;

            return {
              ...prev,
              downloaded: downloaded + event.data.chunkLength,
            };
          });
          break;
        }
        case "Finished": {
          setProgress((prev) => ({
            ...prev,
            done: true,
          }));
        }
      }
    });

    await relaunch();
  }, [update, setProgress]);

  if (!update?.available || !clientVersion) {
    return null;
  }

  const { version } = update;

  return (
    <Dialog defaultOpen={false}>
      {update ? <InnerToast /> : null}
      <DialogContent className="max-w-[65ch]">
        <DialogHeader>
          <DialogTitle>Update Available</DialogTitle>
          <DialogDescription>
            A new version of Retrom is available.{" "}
            <Code>{`${versionToString(clientVersion)} -> ${version}`}</Code>
          </DialogDescription>
        </DialogHeader>

        <Changelog body={update.body} />

        <DialogFooter>
          {progress.total === undefined ? (
            <>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>

              <Button onClick={handleUpdate}>Update</Button>
            </>
          ) : progress.done ? (
            <>
              <Button variant="secondary">Restart Later</Button>
              <Button onClick={relaunch}>Restart</Button>
            </>
          ) : (
            <div className="flex items-stretch gap-2">
              <p>Updating</p>
              <Progress value={progress.downloaded} max={progress.total} />
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Changelog({ body }: { body?: string }) {
  return (
    <ScrollArea className="h-full max-h-[65dvh]">
      <h3>Changelog</h3>

      <p>{body || "No changelog for this release"}</p>
    </ScrollArea>
  );
}

function InnerToast() {
  const { toast } = useToast();
  const { setOpen } = useDialogOpen();

  useEffect(() => {
    let dismiss: (() => void) | undefined;

    dismiss && dismiss();
    const toastInfo = toast({
      title: "Update Available",
      description: "A new version of Retrom is available.",
      action: (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Update
        </Button>
      ),
    });

    dismiss = toastInfo.dismiss;

    return () => {
      dismiss && dismiss();
    };
  }, [toast, setOpen]);

  return <></>;
}
