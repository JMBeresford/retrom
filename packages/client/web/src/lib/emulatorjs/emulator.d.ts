import { Config, Core } from ".";
import { EJS_COMPRESSION } from "./compression";
import { EJS_GameManager } from "./GameManager";
import { EJSControls, GamepadHandler } from "./gamepad";
import { EJS_STORAGE } from "./storage";
import {} from "@types/emscripten/index";

export declare class EmulatorJS {
  config: Config;
  gamepad: GamepadHandler;
  gameManager?: EJS_GameManager;
  compression?: EJS_COMPRESSION;
  Module: EmscriptenModule & {
    AL: { currentCtx: { sources: { gain: GainNode }[] } };
  };
  volume: number;
  muted: boolean;
  controls?: EJSControls;
  defaultControllers: EJSControls;
  keyMap: Record<number, string>;
  controlMenu: Element;
  settings: Record<string, string>;
  isFastForward: boolean;
  paused: boolean;
  coreName: Core;
  saveFileExt: string | false;
  functions?: { [key: string]: Array<() => unknown> };
  touch?: boolean;
  elements: {
    main: HTMLElement;
    parent: HTMLElement;
  };

  storage: {
    bios: EJS_STORAGE;
    core: EJS_STORAGE;
    rom: EJS_STORAGE;
    states: EJS_STORAGE;
  };

  pause: (dontUpdate?: boolean) => void;
  play: (dontUpdate?: boolean) => void;
  setVolume: (volume: number) => void;
  changeSettingOption: <T>(key: string, value: T, startup?: unknown) => void;
  menuOptionChanged: <T>(key: string, value: T) => void;
  checkGamepadInputs: () => void;

  getCores(): {
    atari5200: string[];
    vb: string[];
    nds: string[];
    arcade: string[];
    nes: string[];
    gb: string[];
    coleco: string[];
    segaMS: string[];
    segaMD: string[];
    segaGG: string[];
    segaCD: string[];
    sega32x: string[];
    sega: string[];
    lynx: string[];
    mame: string[];
    ngp: string[];
    pce: string[];
    pcfx: string[];
    psx: string[];
    ws: string[];
    gba: string[];
    n64: string[];
    "3do": string[];
    psp: string[];
    atari7800: string[];
    snes: string[];
    atari2600: string[];
    jaguar: string[];
    segaSaturn: string[];
    amiga: string[];
    c64: string[];
    c128: string[];
    pet: string[];
    plus4: string[];
    vic20: string[];
  };
  requiresThreads(core: unknown): unknown;
  requiresWebGL2(core: unknown): unknown;
  getCore(generic: unknown): unknown;
  createElement(type: unknown): unknown;
  addEventListener(
    element: unknown,
    listener: unknown,
    callback: unknown,
  ): unknown[];
  removeEventListener(data: unknown): void;
  downloadFile(
    path: unknown,
    progressCB: unknown,
    notWithPath: unknown,
    opts: unknown,
  ): unknown;
  toData(data: unknown, rv: unknown): unknown;
  checkForUpdates(): void;
  versionAsInt(ver: unknown): number;
  constructor(element: unknown, config: unknown);
  setColor(color: unknown): void;
  setupAds(ads: unknown, width: unknown, height: unknown): void;
  adBlocked(url: unknown, del: unknown): void;
  on(event: unknown, func: unknown): void;
  callEvent(event: unknown, data: unknown): unknown;
  setElements(element: unknown): void;
  createStartButton(): void;
  startButtonClicked(e: unknown): void;
  createText(): void;
  localization(text: unknown, log: unknown): unknown;
  checkCompression(data: unknown, msg: unknown, fileCbFunc: unknown): unknown;
  checkCoreCompatibility(version: unknown): void;
  startGameError(message: unknown): void;
  downloadGameCore(): void;
  initGameCore(js: unknown, wasm: unknown, thread: unknown): void;
  getBaseFileName(force: unknown): unknown;
  saveInBrowserSupported(): boolean;
  displayMessage(message: unknown, time: unknown): void;
  downloadStartState(): unknown;
  downloadGameFile(
    assetUrl: unknown,
    type: unknown,
    progressMessage: unknown,
    decompressProgressMessage: unknown,
  ): unknown;
  downloadGamePatch(): unknown;
  downloadGameParent(): unknown;
  downloadBios(): unknown;
  downloadRom(): unknown;
  downloadFiles(): void;
  initModule(wasmData: unknown, threadData: unknown): void;
  startGame(): void;
  checkStarted(): void;
  bindListeners(): void;
  checkSupportedOpts(): void;
  updateGamepadLabels(): void;
  createLink(elem: unknown, link: unknown, text: unknown, useP: unknown): void;
  createContextMenu(): void;
  closePopup(): void;
  createPopup(popupTitle: unknown, buttons: unknown, hidden: unknown): unknown;
  selectFile(): unknown;
  isPopupOpen(): boolean;
  isChild(first: unknown, second: unknown): unknown;
  createBottomMenuBar(): void;
  openCacheMenu(): void;
  getControlScheme(): unknown;
  createControlSettingMenu(): void;
  initControlVars(): void;
  setupKeys(): void;
  keyLookup(controllerkey: unknown): string | number;
  keyChange(e: unknown): void;
  gamepadEvent(e: unknown): void;
  setVirtualGamepad(): void;
  handleResize(): void;
  getElementSize(element: unknown): {
    width: unknown;
    height: unknown;
  };
  saveSettings(): void;
  getLocalStorageKey(): string;
  preGetSetting(setting: unknown): unknown;
  loadSettings(): void;
  handleSpecialOptions(option: unknown, value: unknown): void;
  menuOptionChanged(option: unknown, value: unknown): void;
  setupDisksMenu(): void;
  setupSettingsMenu(): void;
  createSubPopup(hidden: unknown): unknown[];
  createNetplayMenu(): void;
  defineNetplayFunctions(): void;
  createCheatsMenu(): void;
  updateCheatUI(): void;
  cheatChanged(checked: unknown, code: unknown, index: unknown): void;
  enableShader(name: unknown): void;
  collectScreenRecordingMediaTracks(
    canvasEl: unknown,
    fps: unknown,
  ): MediaStream;
  screenRecord(): MediaRecorder;
}

declare global {
  export interface Window {
    EmulatorJS?: typeof EmulatorJS;
    EJS_emulator?: EmulatorJS;
  }
}
