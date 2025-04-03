import { Core } from "@/lib/emulatorjs";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import type { EmulatorJS } from "@/lib/emulatorjs/emulator";
import "./play.scss";
import { cn, getFileStub, millisToTimestamp } from "@/lib/utils";
import { useCallback, useState, useMemo } from "react";
import { useUpdateGameMetadata } from "@/mutations/useUpdateGameMetadata";
import { useGameDetail } from "@/providers/game-details";
import { Route as ParentRoute } from ".";
import { useToast } from "@/components/ui/use-toast";
import { Overlay } from "./-utils/overlay";
import { useRemoteFiles } from "./-utils/useRemoteFiles";
import { useUploadSaveState } from "./-utils/useUploadSaveState";
import {
  FocusableElement,
  FocusContainer,
} from "@/components/fullscreen/focus-container";
import { checkIsDesktop } from "@/lib/env";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useApiUrl } from "@/utils/useApiUrl";
import { ConfigExtended, EmulatorJSProvider } from "@/providers/emulator-js";
import { File } from "@retrom/codegen/retrom/files";
import { FilesystemNodeType } from "@retrom/codegen/retrom/file-explorer";

export type EmuJsFrameEvent =
  | "exit"
  | "exit-requested"
  | "save-sync-requested"
  | "save-synced"
  | "states-sync-requested"
  | "states-synced";

export const Route = createLazyFileRoute("/play/$gameId/_layout/frame")({
  component: () => <FrameComponent />,
  errorComponent: () => {
    emitFromFrame("exit");
    return <></>;
  },
});

export function emitFromFrame(event: EmuJsFrameEvent) {
  window.parent.postMessage(event);
}

function FrameComponent() {
  const { coreName } = ParentRoute.useSearch();
  const { uploadFiles, downloadFiles } = useRemoteFiles();
  const { mutate: uploadSaveState } = useUploadSaveState();
  const { toast } = useToast();
  const apiUrl = useApiUrl();
  const navigate = useNavigate();

  const { gameFiles, gameMetadata, game, defaultProfile, emulator } =
    useGameDetail();

  const file =
    gameFiles.find((f) => f.id === game.defaultFileId) ??
    gameFiles.find(
      (f) =>
        defaultProfile &&
        defaultProfile.supportedExtensions.some((e) => f.path.endsWith(e)),
    ) ??
    gameFiles[0];

  const core = (coreName ?? emulator?.libretroName) as Core | undefined;
  if (!apiUrl || !core || !file) {
    throw new Error(`Missing required data for emulation: \
      apiUrl -> ${apiUrl}, core -> ${core}, file -> ${JSON.stringify(file)}`);
  }

  const [startTime, setStartTime] = useState<number | undefined>();
  const { mutateAsync: updateGameMetadata } = useUpdateGameMetadata();

  const handleExit = useCallback(
    async (_emulator: EmulatorJS) => {
      if (checkIsDesktop()) {
        getCurrentWebviewWindow()?.close().catch(console.error);
      } else {
        if (gameMetadata) {
          const meta = { ...gameMetadata };

          if (startTime) {
            const durationMillis = Date.now() - startTime;
            const durationMinutes = durationMillis / 1000 / 60;

            meta.lastPlayed = millisToTimestamp(startTime);
            meta.minutesPlayed = (meta.minutesPlayed ?? 0) + durationMinutes;
          }

          await updateGameMetadata({
            metadata: [meta],
          });
        }

        emitFromFrame("exit");
      }
    },
    [updateGameMetadata, gameMetadata, startTime],
  );

  const extractSave: (e: EmulatorJS) => File | undefined = useCallback(
    (emulatorJS) => {
      if (!emulatorJS.gameManager) {
        return;
      }

      emulatorJS.gameManager.saveSaveFiles();

      const fullPath: string = emulatorJS.gameManager?.getSaveFilePath() ?? "";
      if (!fullPath) {
        return;
      }

      const FS = emulatorJS.gameManager.FS;
      if (!FS.analyzePath(fullPath).exists) {
        console.warn(
          `Save file not found (is this core supported?): ${fullPath}`,
        );
        return;
      }

      const bytes = FS.readFile(fullPath);
      const path = fullPath.replace("/data/", "");
      const time = Date.now();

      const updatedAt = {
        seconds: Math.floor(time / 1000),
        nanos: Math.floor((time % 1000) * 1e6),
      };

      return File.create({
        stat: {
          path,
          updatedAt,
          nodeType: FilesystemNodeType.FILE,
        },
        content: bytes,
      });
    },
    [],
  );

  const handleSave = useCallback(
    async (emulator: EmulatorJS) => {
      const save = extractSave(emulator);

      if (save) {
        await uploadFiles.mutateAsync([save], {
          onSuccess: () => {
            emitFromFrame("save-synced");
            toast({
              title: "Save uploaded",
              description: "Your save has been uploaded successfully",
            });
          },
          onError: (err) => {
            toast({
              title: "Failed to upload save",
              description: err.message,
              variant: "destructive",
            });
          },
        });
      }
    },
    [extractSave, toast, uploadFiles],
  );

  const config: ConfigExtended = useMemo(
    () => ({
      core,
      startOnLoaded: true,
      disableDatabases: true,
      gameName: gameMetadata?.name ?? getFileStub(game.path),
      gameID: game.id,
      ready: (emulator) => {
        emulator.on("exit", async () => {
          await handleSave(emulator).catch(console.error);
          handleExit(emulator).catch(console.error);
        });
      },
      onGameStart: async (emulator) => {
        setStartTime(Date.now());
        const savePath = emulator.gameManager?.getSaveFilePath() ?? "";
        console.log({
          opts: emulator.gameManager?.getCoreOptions()?.split("\n"),
        });

        const remoteSaves = await downloadFiles.mutateAsync(
          savePath.replace("/data/", ""),
          {
            onError: (err) => {
              toast({
                title: "Failed to download save",
                description: err.message,
                variant: "destructive",
              });

              return [];
            },
          },
        );

        remoteSaves?.forEach(({ stat, data }) => {
          const path = `/data/${stat.path}`;

          const parts = path.split("/").slice(1, -1);
          let dir = "";
          parts.forEach((part) => {
            dir += "/" + part;
            if (!emulator?.gameManager?.FS.analyzePath(dir).exists) {
              emulator?.gameManager?.FS.mkdir(dir);
            }
          });

          if (emulator?.gameManager?.FS.analyzePath(path).exists) {
            emulator?.gameManager?.FS.unlink(path);
          }

          emulator?.gameManager?.FS.writeFile(path, data);
        });

        emulator?.gameManager?.loadSaveFiles();
      },
      onSaveSave: handleSave,
      onSaveState: (emulatorJS, info) => {
        uploadSaveState(
          { emulatorJS, ...info, core },
          {
            onSuccess: () => {
              navigate({
                to: ".",
                search: (prev) => ({ ...prev, overlay: false }),
              }).catch(console.error);
            },
          },
        );
      },
      onLoadState: (emulatorJS) => {
        const slot = emulatorJS.settings["save-state-slot"] ?? 1;

        downloadFiles.mutate(`states/${core}/${game.id}/${slot}.state`, {
          onSuccess: (files) => {
            const state = files?.at(0)?.data;
            if (!state) {
              toast({
                title: "Failed to load state",
                description: "State not found",
                variant: "destructive",
              });
            }

            emulatorJS.gameManager?.loadState(state);
            navigate({
              to: ".",
              search: (prev) => ({ ...prev, overlay: false }),
            }).catch(console.error);

            toast({
              title: "State loaded",
              description: "State has been loaded successfully",
            });
          },
          onError: (err) => {
            toast({
              title: "Failed to load state",
              description: err.message,
              variant: "destructive",
            });
          },
        });
      },
    }),
    [
      core,
      gameMetadata,
      game,
      handleSave,
      handleExit,
      downloadFiles,
      toast,
      uploadSaveState,
      navigate,
    ],
  );

  return (
    <div
      className="w-screen h-screen relative"
      onContextMenuCapture={(e) => {
        e.stopPropagation();
      }}
    >
      <FocusContainer
        className="block w-full h-full"
        opts={{ focusKey: "frame-focus-root" }}
      >
        <EmulatorJSProvider file={file} config={config}>
          <Overlay />
        </EmulatorJSProvider>

        <FocusableElement
          opts={{ focusKey: "frame-game-container", forceFocus: true }}
        >
          <div id="game" className={cn("grid place-items-center")}></div>
        </FocusableElement>
      </FocusContainer>
    </div>
  );
}
