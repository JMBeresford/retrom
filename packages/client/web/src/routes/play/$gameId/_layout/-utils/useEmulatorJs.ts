import { GameFile } from "@retrom/codegen/retrom/models/game-files";
import { Config } from "@/lib/emulatorjs";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";
import { useQuery } from "@tanstack/react-query";

type ConfigExtended = Omit<
  Config,
  "onGameStart" | "ready" | "onSaveSave" | "onSaveState" | "onLoadState"
> & {
  ready: (emulator: EmulatorJS) => Promise<void> | void;
  onGameStart: (emulator: EmulatorJS) => Promise<void> | void;
  onSaveSave: (
    emulator: EmulatorJS,
    ...payload: Parameters<NonNullable<Config["onSaveSave"]>>
  ) => Promise<void> | void;
  onSaveState: (
    emulator: EmulatorJS,
    ...payload: Parameters<NonNullable<Config["onSaveState"]>>
  ) => Promise<void> | void;
  onLoadState: (
    emulator: EmulatorJS,
    ...payload: Parameters<NonNullable<Config["onLoadState"]>>
  ) => Promise<void> | void;
};

export function useEmulatorJs(opts: {
  apiUrl: string | URL;
  file: GameFile;
  config: ConfigExtended;
}) {
  const { apiUrl, file, config } = opts;
  const {
    ready,
    onGameStart,
    onSaveSave,
    onSaveState,
    onLoadState,
    ...restConfig
  } = config;
  return useQuery({
    queryKey: ["emulator-js", apiUrl, file.id, restConfig],
    structuralSharing: false,
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
          ready: async () => {
            const emulator = window.EJS_emulator!;
            console.log(emulator);
            resolve(emulator);
            if (ready) {
              await ready(emulator);
            }
          },
          onGameStart: () => onGameStart?.(window.EJS_emulator!),
          onSaveSave: (payload) => onSaveSave?.(window.EJS_emulator!, payload),
          onSaveState: (payload) =>
            onSaveState?.(window.EJS_emulator!, payload),
          onLoadState: (payload) =>
            onLoadState?.(window.EJS_emulator!, payload),

          ...restConfig,
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
}
