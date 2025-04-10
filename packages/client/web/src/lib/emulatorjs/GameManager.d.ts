declare class ModuleFS implements FS {}
export declare class EJS_GameManager {
  FS: typeof FS;

  functions: {
    saveStateInfo: () => unknown;
  };

  constructor(Module: unknown, EJS: unknown);
  mountFileSystems(): unknown;
  writeConfigFile(): void;
  loadExternalFiles(): unknown;
  writeFile(path: unknown, data: unknown): void;
  mkdir(path: unknown): void;
  getRetroArchCfg(): string;
  initShaders(): void;
  clearEJSResetTimer(): void;
  restart(): void;
  getState(): Uint8Array;
  loadState(state: unknown): void;
  screenshot(): Promise<Uint8Array>;
  quickSave(slot: unknown): void;
  quickLoad(slot: unknown): void;
  simulateInput(player: unknown, index: unknown, value: unknown): void;
  getFileNames(): string[];
  createCueFile(fileNames: unknown): string;
  loadPpssppAssets(): unknown;
  setVSync(enabled: unknown): void;
  toggleMainLoop(playing: unknown): void;
  getCoreOptions(): string;
  setVariable(option: unknown, value: unknown): void;
  setCheat(index: unknown, enabled: unknown, code: unknown): void;
  resetCheat(): void;
  toggleShader(active: unknown): void;
  getDiskCount(): unknown;
  getCurrentDisk(): unknown;
  setCurrentDisk(disk: unknown): void;
  getSaveFilePath(): string | undefined;
  saveSaveFiles(): void;
  supportsStates(): boolean;
  getSaveFile(): Uint8Array;
  loadSaveFiles(): void;
  setFastForwardRatio(ratio: unknown): void;
  toggleFastForward(active: unknown): void;
  setSlowMotionRatio(ratio: unknown): void;
  toggleSlowMotion(active: unknown): void;
  setRewindGranularity(value: unknown): void;
  getFrameNum(): unknown;
  setVideoRotation(rotation: unknown): void;
}

declare global {
  export interface Window {
    EJS_GameManager?: typeof EJS_GameManager;
  }
}
