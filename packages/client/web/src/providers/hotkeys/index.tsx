import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
} from "react";
import { HotkeyZone, useHotkeyLayerContext } from "./layers";
import { GAMEPAD_BUTTON_EVENT, GamepadButtonEvent } from "../gamepad/event";
import { useInputDeviceContext } from "../input-device";

export type Hotkey = (typeof Hotkey)[number];
export const Hotkey = [
  "ACCEPT",
  "BACK",
  "MENU",
  "OPTION",
  "LEFT",
  "RIGHT",
  "UP",
  "DOWN",
  "PAGE_LEFT",
  "PAGE_RIGHT",
] as const;

export const HotkeyToKeyboardHotkey: Record<Hotkey, KeyboardEvent["key"]> = {
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

export const KeyboardHotkeyToHotkey: Record<KeyboardEvent["key"], Hotkey> =
  Object.fromEntries(
    Object.entries(HotkeyToKeyboardHotkey).map(([key, value]) => [
      value,
      key as Hotkey,
    ]),
  );

export const HotkeyToGamepadButton: Record<Hotkey, number> = {
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

export const GamepadButtonToHotkey: Record<number, Hotkey> = Object.fromEntries(
  Object.entries(HotkeyToGamepadButton).map(([key, value]) => [
    value,
    key as Hotkey,
  ]),
);

export type HotkeyHandler = (
  event?: KeyboardEvent | ReactKeyboardEvent | GamepadButtonEvent,
) => unknown;

export type HotkeyHandlerInfo = {
  handler?: HotkeyHandler | undefined;
  zone?: HotkeyZone;
  label?: string;
};

export type HotkeyHandlers = Partial<Record<Hotkey, HotkeyHandlerInfo>>;

export function useHotkeys(opts: {
  handlers: HotkeyHandlers;
  enabled?: boolean;
}) {
  const { handlers, enabled = true } = opts;
  const layerContext = useHotkeyLayerContext();
  const [_, setInputDevice] = useInputDeviceContext();

  const handleHotkey = useCallback(
    (
      hotkey: Hotkey,
      event?: KeyboardEvent | ReactKeyboardEvent | GamepadButtonEvent,
    ) => {
      const handlerInfo = handlers[hotkey];
      if (!handlerInfo) {
        return;
      }

      const { handler, zone } = handlerInfo;

      const zoneActive = layerContext?.isZoneActive(zone) ?? true;
      if (!zoneActive || !handler) {
        return;
      }

      if (!(event instanceof GamepadButtonEvent)) {
        setInputDevice("hotkeys");
      }

      handler(event);
    },
    [handlers, layerContext, setInputDevice],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      const pressed = event.key;
      const hotkey = KeyboardHotkeyToHotkey[pressed];

      handleHotkey(hotkey, event);
    },
    [enabled, handleHotkey],
  );

  const onGamepadButton = useCallback(
    (event: GamepadButtonEvent) => {
      const button = event.detail.button;
      const pressed = event.detail.gamepad.buttons.at(button)?.pressed;

      if (!enabled || !pressed) {
        return;
      }

      const hotkey = GamepadButtonToHotkey[button];
      handleHotkey(hotkey, event);
    },
    [enabled, handleHotkey],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener(GAMEPAD_BUTTON_EVENT, onGamepadButton);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener(GAMEPAD_BUTTON_EVENT, onGamepadButton);
    };
  }, [onKeyDown, onGamepadButton]);
}
