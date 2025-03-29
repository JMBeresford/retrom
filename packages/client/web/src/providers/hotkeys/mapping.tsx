import { Hotkey } from ".";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const DefaultHotkeyToKeyboardHotkey: Record<Hotkey, KeyboardEvent["key"]> = {
  ACCEPT: "f",
  BACK: "b",
  MENU: "m",
  OPTION: "t",
  UP: "k",
  LEFT: "h",
  DOWN: "j",
  RIGHT: "l",
  PAGE_LEFT: "q",
  PAGE_RIGHT: "e",
} as const;

const DefaultHotkeyToGamepadButton: Record<Hotkey, number> = {
  ACCEPT: 0,
  BACK: 1,
  MENU: 9,
  OPTION: 8,
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
  PAGE_LEFT: 4,
  PAGE_RIGHT: 5,
} as const;

function reverseObject<K extends string | number, V extends string | number>(
  obj: Record<K, V>,
): Record<V, K> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [v, k]),
  ) as Record<V, K>;
}

export type HotkeyMappingState = {
  /**
   * Gamepad button to {@link Hotkey} mapping.
   */
  gamepadToHotkey: Record<number, Hotkey>;

  /**
   * Keyboard event key to {@link Hotkey} mapping.
   */
  keyboardToHotkey: Record<string, Hotkey>;

  hotkeyToKeyboard: Record<Hotkey, string>;
  hotkeyToGamepadButton: Record<Hotkey, number>;

  setKeyboardMap: (
    cb: (map: Record<Hotkey, string>) => Record<Hotkey, string>,
  ) => void;
  setGamepadMap: (
    cb: (map: Record<Hotkey, number>) => Record<Hotkey, number>,
  ) => void;
};

export const useHotkeyMapping = create<HotkeyMappingState>()(
  persist(
    (set, get) => ({
      keyboardToHotkey: reverseObject(DefaultHotkeyToKeyboardHotkey),
      gamepadToHotkey: reverseObject(DefaultHotkeyToGamepadButton),

      hotkeyToKeyboard: DefaultHotkeyToKeyboardHotkey,
      hotkeyToGamepadButton: DefaultHotkeyToGamepadButton,

      setKeyboardMap: (cb) => {
        const next = cb(get().hotkeyToKeyboard);

        console.log({ next });

        return set({
          hotkeyToKeyboard: next,
          keyboardToHotkey: reverseObject(next),
        });
      },
      setGamepadMap: (cb) => {
        const next = cb(get().hotkeyToGamepadButton);

        return set({
          hotkeyToGamepadButton: next,
          gamepadToHotkey: reverseObject(next),
        });
      },
    }),
    { name: "retrom-hotkey-mapping", version: 1 },
  ),
);
