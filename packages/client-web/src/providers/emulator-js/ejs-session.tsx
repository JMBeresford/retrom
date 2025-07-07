import {
  useMemo,
  createContext,
  PropsWithChildren,
  useContext,
  useCallback,
  useLayoutEffect,
} from "react";
import { useEmulatorJS } from ".";
import { type File, FileSchema } from "@retrom/codegen/retrom/files_pb";
import { FilesystemNodeType } from "@retrom/codegen/retrom/file-explorer_pb";
import { emitFromFrame } from "@/routes/play/$gameId/_layout/frame.lazy";
import { checkIsDesktop } from "@/lib/env";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useGameDetail } from "../game-details";
import { millisToTimestamp } from "@/lib/utils";
import { useUpdateGameMetadata } from "@/mutations/useUpdateGameMetadata";
import { useGetSaveFiles } from "@/queries/saveFiles";
import { useUpdateSaveFiles } from "@/mutations/saveFiles";
import { toast } from "@retrom/ui/hooks/use-toast";
import {
  SaveFiles,
  UpdateSaveFilesResponse,
} from "@retrom/codegen/retrom/services/saves-service_pb";
import { clone, create } from "@bufbuild/protobuf";
import { GameMetadataSchema } from "@retrom/codegen/retrom/models/metadata_pb";

export type EJSSessionState = Readonly<{
  extractSave: () => File | undefined;
  saveSaveFile: () => Promise<UpdateSaveFilesResponse | undefined>;
  handleExit: () => Promise<void>;
  loadSaveFiles: (files: SaveFiles) => void;
  remoteSaveFiles: SaveFiles | undefined;
  restart: () => void;
}>;

const EJSSessionStateContext = createContext<EJSSessionState | undefined>(
  undefined,
);

export function EJSSessionStateProvider(props: PropsWithChildren) {
  const emulatorJS = useEmulatorJS();
  const { gameMetadata, game, emulator } = useGameDetail();
  // const { uploadFiles, downloadFiles } = useRemoteFiles();
  const { mutateAsync: updateSave } = useUpdateSaveFiles();
  const saveFilesQuery = useGetSaveFiles({
    saveFilesSelectors: [{ gameId: game.id, emulatorId: emulator?.id }],
  });

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
    const time = Date.now();

    const updatedAt = {
      seconds: BigInt(Math.floor(time / 1000)),
      nanos: Math.floor((time % 1000) * 1e6),
    };

    const path = fullPath.startsWith("/") ? fullPath.slice(1) : fullPath;

    return create(FileSchema, {
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
      console.log("Uploading save file:", save);
      return updateSave({
        saveFilesSelectors: [
          { files: [save], gameId: game.id, emulatorId: emulator?.id },
        ],
      });
    } else {
      toast({
        title: "Save File Not Uploaded",
        description: "No save file found to upload.",
        variant: "destructive",
      });

      return;
    }
  }, [updateSave, extractSave, game.id, emulator?.id]);

  const loadSaveFiles = useCallback(
    (saveFiles: SaveFiles) => {
      const { files } = saveFiles;

      console.log("Loading save files:", files);

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

        const { path } = stat;
        console.log("Loading save file:", path);

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
    [emulatorJS.gameManager],
  );

  const restart = useCallback(() => {
    const gameManager = emulatorJS.gameManager;

    if (gameManager) {
      gameManager.restart();
    }
  }, [emulatorJS.gameManager]);

  const handleExit = useCallback(async () => {
    if (checkIsDesktop()) {
      getCurrentWebviewWindow()?.close().catch(console.error);
    } else {
      if (gameMetadata) {
        const { $typeName: _, ...meta } = clone(
          GameMetadataSchema,
          gameMetadata,
        );

        if (startTime) {
          const durationMillis = Date.now() - startTime;
          const durationMinutes = durationMillis / 1000 / 60;

          meta.lastPlayed = {
            ...millisToTimestamp(startTime),
            $typeName: "google.protobuf.Timestamp",
          };

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

  const remoteSaveFiles = useMemo(
    () => saveFilesQuery.data?.saveFiles.at(0),
    [saveFilesQuery.data],
  );

  useLayoutEffect(() => {
    console.log({ remoteSaveFiles });
    if (!emulatorJS.retromStarted && remoteSaveFiles !== undefined) {
      emulatorJS.retromStarted = true;
      loadSaveFiles(remoteSaveFiles);
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
  }, [emulatorJS, saveSaveFile, loadSaveFiles, remoteSaveFiles]);

  const value: EJSSessionState = useMemo(
    () => ({
      extractSave,
      saveSaveFile,
      restart,
      handleExit,
      loadSaveFiles,
      remoteSaveFiles,
    }),
    [
      extractSave,
      saveSaveFile,
      handleExit,
      loadSaveFiles,
      remoteSaveFiles,
      restart,
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
