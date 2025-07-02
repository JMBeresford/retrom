import { EJS_SHADERS } from "./shaders";

export type PrefixedConfig = {
  [K in keyof Config as `EJS_${K}`]: Config[K];
};

declare global {
  export interface Window extends PrefixedConfig {
    [key: `EJS_${string}`]: string | boolean;
    EJS_Buttons: Record<string, boolean>;
  }
}

export type Core = (typeof cores)[number];
export const cores = [
  "a5200",
  "beetle_vb",
  "melonds",
  "desmume",
  "desmume2015",
  "fbneo",
  "fbalpha2012_cps1",
  "fbalpha2012_cps2",
  "fceumm",
  "nestopia",
  "gambatte",
  "gearcoleco",
  "smsplus",
  "genesis_plus_gx",
  "picodrive",
  "genesis_plus_gx",
  "picodrive",
  "genesis_plus_gx",
  "genesis_plus_gx",
  "picodrive",
  "picodrive",
  "genesis_plus_gx",
  "picodrive",
  "handy",
  "mame2003_plus",
  "mame2003",
  "mednafen_ngp",
  "mednafen_pce",
  "mednafen_pcfx",
  "pcsx_rearmed",
  "mednafen_psx_hw",
  "mednafen_wswan",
  "mgba",
  "mupen64plus_next",
  "parallel_n64",
  "opera",
  "ppsspp",
  "prosystem",
  "snes9x",
  "stella2014",
  "virtualjaguar",
  "yabause",
  "puae",
  "vice_x64sc",
  "vice_x128",
  "vice_xpet",
  "vice_xplus4",
  "vice_xvic",
] as const;

export type Config = {
  player?: string;
  gameUrl?: string;
  pathtodata?: string;
  core?: (typeof cores)[number];
  biosUrl?: string;
  gameName?: string;
  color?: string;
  adUrl?: string;
  adMode?: string;
  adTimer?: string;
  adSize?: string;
  alignStartButton?: string;
  VirtualGamepadSettings?: string;
  Buttons?: {
    playPause: boolean;
    restart: boolean;
    mute: boolean;
    settings: boolean;
    fullscreen: boolean;
    saveState: boolean;
    loadState: boolean;
    screenRecord: boolean;
    gamepad: boolean;
    cheat: boolean;
    volume: boolean;
    saveSavFiles: boolean;
    loadSavFiles: boolean;
    quickSave: boolean;
    quickLoad: boolean;
    screenshot: boolean;
    cacheManager: boolean;
    exitEmulation: boolean;
    contextMenuButton: boolean;
    rightClick: boolean;
  };
  volume?: number;
  defaultControls?: unknown;
  startOnLoaded?: boolean;
  fullscreenOnLoaded?: boolean;
  paths?: {
    ["GameManager.js"]?: string;
    ["emulator.min.css"]?: string;
    ["emulator.css"]?: string;
    ["emulator.min.js"]?: string;
    ["emulator.js"]?: string;
    ["gamepad.js"]?: string;
    ["loader.js"]?: string;
    ["nipplejs.js"]?: string;
    ["shaders.js"]?: string;
    ["socket.io.min.js"]?: string;
    ["storage.js"]?: string;
    ["version.json"]?: string;
    ["compression.js"]?: string;
  };
  loadStateURL?: string;
  CacheLimit?: number;
  cheats?: [string, string][];
  defaultOptions?: Record<string, string | number | boolean>;
  gamePatchUrl?: string;
  gameParentUrl?: string;
  netplayServer?: string;
  gameID?: number;
  backgroundImage?: string;
  backgroundBlur?: boolean;
  backgroundColor?: string;
  controlScheme?:
    | "nes"
    | "gb"
    | "gba"
    | "snes"
    | "n64"
    | "nds"
    | "vb"
    | "segaMD"
    | "segaCD"
    | "sega32x"
    | "segaMS"
    | "segaGG"
    | "segaSaturn"
    | "3do"
    | "atari2600"
    | "atari7800"
    | "lynx"
    | "jaguar"
    | "arcade"
    | "mame";
  threads?: boolean;
  disableCue?: boolean;
  startButtonName?: string;
  softLoad?: boolean;
  screenRecording?: {
    width: number;
    height: number;
    fps: number;
    videoBitrate: number;
    audioBitrate: number;
  };
  externalFiles?: Record<string, string>;
  disableDatabases?: boolean;
  disableLocalStorage?: boolean;
  forceLegacyCores?: boolean;
  noAutoFocus?: boolean;
  videoRotation?: 0 | 1 | 2 | 3;
  shaders?: typeof EJS_SHADERS;
  language?:
    | "en-US "
    | "pt-BR "
    | "es-ES "
    | "el-GR "
    | "ja-JA "
    | "zh-CN "
    | "hi-HI "
    | "ar-AR "
    | "jv-JV "
    | "ben-BEN "
    | "ru-RU "
    | "de-GER "
    | "ko-KO "
    | "af-FR "
    | "it-IT "
    | "tr-Tr "
    | "fa-AF ";
  langJson?: Record<string, string>;
  ready?: () => void | Promise<void>;
  onGameStart?: () => void | Promise<void>;
  onLoadState?: (args: void) => void | Promise<void>;
  onSaveState?: (data: {
    screenshot: Uint8Array;
    state: Uint8Array;
  }) => void | Promise<void>;
  onLoadSave?: () => void | Promise<void>;
  onSaveSave?: (payload: {
    save: Uint8Array;
    screenshot: Uint8Array;
  }) => void | Promise<void>;
};
