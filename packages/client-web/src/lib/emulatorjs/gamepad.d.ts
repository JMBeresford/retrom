export declare class GamepadHandler {
  constructor();
  terminate(): void;
  getGamepads(): unknown;
  loop(): void;
  updateGamepadState(): void;
  dispatchEvent(name: unknown, arg: unknown): void;
  on(name: unknown, cb: unknown): void;
  getButtonLabel(index: number): null | string;
  getAxisLabel(axis: string, value: number): string | null;
}

declare global {
  export interface Window {
    GamepadHandler?: typeof GamepadHandler;
  }
}

export type EJSControlConfig = Partial<
  Record<
    keyof EmulatorJSControlMap,
    {
      /**
       * Key code for this control
       */
      value: number;
      /**
       * Gamepad button for this control
       */
      value2: string;
    }
  >
>;

export type EJSGamepadEvent = {
  gamepadIndex: number;
  label: string;
} & (
  | { type: "axischanged"; axis: string; value: number }
  | { type: "buttonup" | "buttondown"; index: number }
);

export type EJSControls = {
  0: EJSControlConfig;
  1: EJSControlConfig;
  2: EJSControlConfig;
  3: EJSControlConfig;
};

export interface EmulatorJSControlMap {
  "0": "B";
  "1": "Y";
  "2": "SELECT";
  "3": "START";
  "4": "UP";
  "5": "DOWN";
  "6": "LEFT";
  "7": "RIGHT";
  "8": "A";
  "9": "X";
  "10": "L";
  "11": "R";
  "12": "L2";
  "13": "R2";
  "14": "L3";
  "15": "R3";
  "19": "L STICK UP";
  "18": "L STICK DOWN";
  "17": "L STICK LEFT";
  "16": "L STICK RIGHT";
  "23": "R STICK UP";
  "22": "R STICK DOWN";
  "21": "R STICK LEFT";
  "20": "R STICK RIGHT";
  "24": "QUICK SAVE STATE";
  "25": "QUICK LOAD STATE";
  "26": "CHANGE STATE SLOT";
  "27": "FAST FORWARD";
  "28": "SLOW MOTION";
  "29": "REWIND";
}
