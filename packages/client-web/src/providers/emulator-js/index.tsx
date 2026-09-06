import { createContext, useContext, ReactNode, useRef } from "react";
import { Config, Core } from "@/lib/emulatorjs";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";
import { useQuery } from "@tanstack/react-query";
import { useApiUrl } from "@/utils/urls";
import { Loader2 } from "lucide-react";
import { useGameDetail } from "../game-details";
import { getFileStub } from "@/lib/utils";
import { useSearch } from "@tanstack/react-router";
import { CoreOptionsProvider } from "./core-options";
import { ControlOptionsProvider } from "./control-options";
import { GameOptionsProvider } from "./game-options";
import { EJSSessionStateProvider } from "./ejs-session";
import { useRetromClient } from "../retrom-client";
import { create } from "@bufbuild/protobuf";
import { GetSaveFilesRequestSchema } from "@retrom/codegen/retrom/services/saves/v1/saves-service_pb";

type EmulatorJSContextValue = EmulatorJS;

const EmulatorJSContext = createContext<EmulatorJSContextValue | undefined>(
  undefined,
);

export function EmulatorJSProvider(props: { children: ReactNode }) {
  const { coreName } = useSearch({ strict: false });
  const apiUrl = useApiUrl();
  const { gameFiles, game, gameMetadata, defaultProfile, emulator } =
    useGameDetail();
  const { children } = props;
  const retromClient = useRetromClient();

  const core = (coreName ?? emulator?.libretroName) as Core | undefined;
  const isDosBoxPure = core === "dosbox_pure";

  const file =
    gameFiles.find((f) => f.id === game.defaultFileId) ??
    gameFiles.find(
      (f) =>
        defaultProfile &&
        defaultProfile.supportedExtensions.some((e) => f.path.endsWith(e)),
    ) ??
    gameFiles[0];

  const savesPromiseRef = useRef<ReturnType<
    typeof retromClient.savesClient.getSaveFiles
  > | null>(null);

  const { data: emulatorJS } = useQuery({
    queryKey: ["emulator-js", apiUrl, file.id],
    structuralSharing: false,
    staleTime: Infinity,
    queryFn: () => {
      return new Promise<EmulatorJS>((resolve, reject) => {
        const dataUrl = new URL(
          "./rest/public/emulator-js/data/",
          apiUrl,
        ).toString();

        const loaderUrl = new URL("./loader.js", dataUrl);
        const gameUrl = new URL(`./rest/file/${file.id}`, apiUrl).toString();

        if (isDosBoxPure) {
          savesPromiseRef.current = retromClient.savesClient.getSaveFiles(
            create(GetSaveFilesRequestSchema, {
              saveFilesSelectors: [
                { gameId: game.id, emulatorId: emulator?.id },
              ],
            }),
          );
        }

        const configFinal: Config = {
          player: "#game",
          gameUrl,
          pathtodata: dataUrl,
          color: "#6132ac",
          threads: !!window.SharedArrayBuffer,
          backgroundColor: "#00000000",
          startButtonName: "Launch Game",
          core,
          startOnLoaded: true,
          disableDatabases: true,
          gameName: gameMetadata?.name ?? getFileStub(game.path),
          gameID: game.id,
          ...(isDosBoxPure && {
            externalFiles: {
              "/system/MT32_CONTROL.ROM": new URL(
                "./rest/public/system/MT32_CONTROL.ROM",
                apiUrl,
              ).toString(),
              "/system/MT32_PCM.ROM": new URL(
                "./rest/public/system/MT32_PCM.ROM",
                apiUrl,
              ).toString(),
            },
          }),
          ready: () => {
            const ejs = window.EJS_emulator;

            if (!ejs) {
              return reject(new Error("emulatorJS not initialized"));
            }

            console.log("EmulatorJS initialized");
            console.log(ejs);

            ejs.on("exit", () => {
              console.warn("emulatorJS called exit");
            });

            if (isDosBoxPure) {
              patchDownloadRom(ejs, savesPromiseRef.current);
            }
          },
          onGameStart: () => {
            console.log("emulatorJS called game-start");
            const ejs = window.EJS_emulator;

            if (!ejs) {
              return reject(new Error("emulatorJS not initialized"));
            }

            if (isDosBoxPure) {
              patchGetSaveFilePath(ejs);
            }

            resolve(ejs);
          },
          onSaveSave: () => {
            console.warn("emulatorJS called save-save");
          },
          onSaveState: () => {
            console.warn("emulatorJS called save-state");
          },
          onLoadState: () => {
            console.warn("emulatorJS called load-state");
          },
        };

        for (const k of Object.keys(configFinal)) {
          const key = `EJS_${k as keyof Config}` as const;
          const value = configFinal[k as keyof Config];
          Object.assign(window, { [key]: value });
          if (import.meta.env.DEV) {
            window.EJS_DEBUG_XX = true;
          }
        }

        import(/* @vite-ignore */ loaderUrl.toString()).catch((e: unknown) =>
          reject(e instanceof Error ? e : new Error(JSON.stringify(e))),
        );
      });
    },
  });

  // Wait for the emuJS instance to be created,
  // then create and provide context
  if (!emulatorJS) {
    return (
      <div>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <EmulatorJSContext.Provider value={emulatorJS}>
      <EJSSessionStateProvider>
        <GameOptionsProvider>
          <CoreOptionsProvider>
            <ControlOptionsProvider>{children}</ControlOptionsProvider>
          </CoreOptionsProvider>
        </GameOptionsProvider>
      </EJSSessionStateProvider>
    </EmulatorJSContext.Provider>
  );
}

export function useEmulatorJS() {
  const context = useContext(EmulatorJSContext);
  if (context === undefined) {
    throw new Error("useEmulatorJS must be used within an EmulatorJSProvider");
  }

  return context;
}

export function useMaybeEmulatorJS() {
  return useContext(EmulatorJSContext);
}

/**
 * Fix 1 + Fix 3: Monkey-patch downloadRom to write the game ZIP as-is
 * (instead of extracting it) and inject cloud saves before core init.
 *
 * DOSBox Pure needs the ZIP directly so it can mount it as a virtual drive
 * and track filesystem changes into a .pure.zip save archive.
 */
function patchDownloadRom(
  ejs: EmulatorJS,
  savesPromise: ReturnType<
    ReturnType<typeof useRetromClient>["savesClient"]["getSaveFiles"]
  > | null,
) {
  ejs.downloadRom = async function (this: EmulatorJS) {
    this.textElem.innerText = this.localization("Download Game Data");

    const gameUrl = this.config.gameUrl ?? "";
    const fileId = gameUrl.split("/").pop() ?? "game";
    const fileName = fileId + ".zip";

    const resp = await fetch(gameUrl);
    const data = new Uint8Array(await resp.arrayBuffer());

    this.fileName = fileName;
    this.gameManager!.FS.writeFile(fileName, data);

    if (savesPromise) {
      try {
        const saveResponse = await savesPromise;
        const saveFiles = saveResponse.saveFiles.at(0);

        if (saveFiles) {
          const FS = this.gameManager!.FS;
          for (const { stat, content } of saveFiles.files) {
            if (!stat) continue;
            const pathFromStat = stat.path;
            const fullPath = pathFromStat.startsWith("/")
              ? pathFromStat
              : "/" + pathFromStat;

            const pathSegments = fullPath.split("/").filter(Boolean);
            const parentSegments = pathSegments.slice(0, -1);
            for (let i = 1; i <= parentSegments.length; i++) {
              const dir = "/" + parentSegments.slice(0, i).join("/");
              if (!FS.analyzePath(dir).exists) {
                FS.mkdir(dir);
              }
            }

            if (FS.analyzePath(fullPath).exists) {
              FS.unlink(fullPath);
            }

            FS.writeFile(fullPath, content);
          }
          console.log("[retrom] Cloud saves written to FS before core init");
        }
      } catch (e) {
        console.error("[retrom] Failed to pre-load cloud saves:", e);
      }
    }
  }.bind(ejs);
}

/**
 * Fix 2: Monkey-patch getSaveFilePath on the gameManager so it returns
 * the .pure.zip path instead of .srm for DOSBox Pure.
 */
function patchGetSaveFilePath(ejs: EmulatorJS) {
  const gm = ejs.gameManager;
  if (!gm) return;

  const original = gm.getSaveFilePath.bind(gm);

  gm.getSaveFilePath = function () {
    const p = original();
    if (p && p.endsWith(".srm")) {
      return p.replace(/\.srm$/, ".pure.zip");
    }
    return p;
  };
}
