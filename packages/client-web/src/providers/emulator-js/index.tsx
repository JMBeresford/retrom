import { createContext, useContext, ReactNode } from "react";
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

  const core = (coreName ?? emulator?.libretroName) as Core | undefined;
  const file =
    gameFiles.find((f) => f.id === game.defaultFileId) ??
    gameFiles.find(
      (f) =>
        defaultProfile &&
        defaultProfile.supportedExtensions.some((e) => f.path.endsWith(e)),
    ) ??
    gameFiles[0];

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
          ready: () => {
            const emulator = window.EJS_emulator;

            if (!emulator) {
              return reject(new Error("emulatorJS not initialized"));
            }

            console.log("EmulatorJS initialized");
            console.log(emulator);

            emulator.on("exit", () => {
              console.warn("emulatorJS called exit");
            });
          },
          onGameStart: () => {
            console.log("emulatorJS called game-start");
            const emulator = window.EJS_emulator;

            if (!emulator) {
              return reject(new Error("emulatorJS not initialized"));
            }

            resolve(emulator);
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
