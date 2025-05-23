import {
  useMemo,
  createContext,
  PropsWithChildren,
  useContext,
  useCallback,
  useLayoutEffect,
} from "react";
import { useEmulatorJS } from ".";
import { File } from "@retrom/codegen/retrom/files";
import { FilesystemNodeType } from "@retrom/codegen/retrom/file-explorer";
import { emitFromFrame } from "@/routes/play/$gameId/_layout/frame.lazy";
import { toast } from "@/components/ui/use-toast";
import { useRemoteFiles } from "@/routes/play/$gameId/_layout/-utils/useRemoteFiles";
import { checkIsDesktop } from "@/lib/env";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useGameDetail } from "../game-details";
import { millisToTimestamp } from "@/lib/utils";
import { useUpdateGameMetadata } from "@/mutations/useUpdateGameMetadata";
import { Progress } from "@/components/ui/progress";

export type EJSSessionState = Readonly<{
  extractSave: () => File | undefined;
  saveSaveFile: () => Promise<void>;
  handleExit: () => Promise<void>;
  loadSaveFiles: (files?: File[]) => Promise<void>;
  downloadRemoteSaveFiles: () => Promise<File[]>;
}>;

const EJSSessionStateContext = createContext<EJSSessionState | undefined>(
  undefined,
);

export function EJSSessionStateProvider(props: PropsWithChildren) {
  const emulatorJS = useEmulatorJS();
  const { gameMetadata } = useGameDetail();
  const { uploadFiles, downloadFiles } = useRemoteFiles();
  const startTime = useMemo(() => Date.now(), []);
  const { mutateAsync: updateGameMetadata } = useUpdateGameMetadata();

  const extractSave: () => File | undefined = useCallback(() => {
    if (!emulatorJS?.gameManager) {
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
  }, [emulatorJS]);

  const saveSaveFile = useCallback(async () => {
    const save = extractSave();

    if (save) {
      const { update } = toast({
        id: "upload-save-file",
        title: "Uploading Save File",
        description: <Progress />,
        duration: Infinity,
      });

      await uploadFiles.mutateAsync([save], {
        onSuccess: () => {
          emitFromFrame("save-synced");

          update({
            title: "Save Uploaded",
            description: "Your save has been uploaded successfully",
          });
        },
        onError: (err) => {
          update({
            title: "Failed to upload save",
            description: err.message,
            variant: "destructive",
          });
        },
      });
    }
  }, [uploadFiles, extractSave]);

  const downloadRemoteSaveFiles = useCallback(async () => {
    const savePath = emulatorJS.gameManager?.getSaveFilePath() ?? "";

    const { update } = toast({
      id: "download-remote-saves",
      duration: Infinity,
      title: "Downloading Save Files",
      description: <Progress />,
    });

    try {
      const res = await downloadFiles.mutateAsync(
        savePath.replace("/data/", ""),
        {
          onError: (err) => {
            throw err;
          },
        },
      );

      update({
        id: "download-remote-saves",
        title: "Save files downloaded",
        description: "Your save files have been downloaded successfully",
        duration: 5000,
      });

      return res;
    } catch (err) {
      update({
        title: "Failed to download save",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });

      return [];
    }
  }, [downloadFiles, emulatorJS]);

  const loadSaveFiles = useCallback(
    async (_files?: File[]) => {
      const files = _files ?? (await downloadRemoteSaveFiles()) ?? [];

      const gameManager = emulatorJS.gameManager;
      if (!gameManager) {
        console.warn("No game manager found, is the emulator running?");
        return;
      }

      for (const { stat, content } of files) {
        if (!stat) {
          console.warn("No stat found for save file");
          continue;
        }

        const path = `/data/${stat.path}`;

        const parts = path.split("/").slice(1, -1);
        let dir = "";
        parts.forEach((part) => {
          dir += "/" + part;
          if (!gameManager.FS.analyzePath(dir).exists) {
            gameManager.FS.mkdir(dir);
          }
        });

        if (gameManager.FS.analyzePath(path).exists) {
          gameManager.FS.unlink(path);
        }

        gameManager.FS.writeFile(path, content);
      }

      gameManager.loadSaveFiles();
    },
    [downloadRemoteSaveFiles, emulatorJS.gameManager],
  );

  const handleExit = useCallback(async () => {
    if (checkIsDesktop()) {
      getCurrentWebviewWindow()?.close().catch(console.error);
    } else {
      if (gameMetadata) {
        const meta = { ...gameMetadata };

        if (startTime) {
          const durationMillis = Date.now() - startTime;
          const durationMinutes = durationMillis / 1000 / 60;

          meta.lastPlayed = millisToTimestamp(startTime);
          meta.minutesPlayed = Math.floor(
            (meta.minutesPlayed ?? 0) + durationMinutes,
          );
        }

        await updateGameMetadata({
          metadata: [meta],
        });
      }

      emitFromFrame("exit");
    }
  }, [updateGameMetadata, gameMetadata, startTime]);

  useLayoutEffect(() => {
    if (!emulatorJS.retromStarted) {
      emulatorJS.retromStarted = true;
      loadSaveFiles().catch(console.error);
    }
    // emulatorJS.on("saveSave", saveSaveFile);
    //
    // return () => {
    //   if (emulatorJS.functions?.["saveSave"]) {
    //     emulatorJS.functions["saveSave"] = emulatorJS.functions[
    //       "saveSave"
    //     ].filter((f) => f !== saveSaveFile);
    //   }
    // };
  }, [emulatorJS, saveSaveFile, loadSaveFiles]);

  const value: EJSSessionState = useMemo(
    () => ({
      extractSave,
      saveSaveFile,
      handleExit,
      loadSaveFiles,
      downloadRemoteSaveFiles,
    }),
    [
      extractSave,
      saveSaveFile,
      handleExit,
      loadSaveFiles,
      downloadRemoteSaveFiles,
    ],
  );

  return (
    <EJSSessionStateContext.Provider value={value}>
      {props.children}
    </EJSSessionStateContext.Provider>
  );
}

export function useEJSSessionState() {
  const ctx = useContext(EJSSessionStateContext);
  if (!ctx) {
    throw new Error(
      "useEJSSessionState must be used within a EJSSessionStateProvider",
    );
  }

  return ctx;
}
