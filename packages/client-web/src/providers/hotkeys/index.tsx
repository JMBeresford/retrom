import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
} from "react";
import { HotkeyZone, useHotkeyLayerContext } from "./layers";
import { GamepadButtonDownEvent } from "../gamepad/event";
import { useInputDeviceContext } from "../input-device";
import { useHotkeyMapping } from "./mapping";

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

export type HotkeyHandler = (
  event?: KeyboardEvent | ReactKeyboardEvent | GamepadButtonDownEvent,
) => unknown;

export type HotkeyHandlerInfo = {
  handler?: HotkeyHandler | undefined;
  zone?: HotkeyZone;
  actionBar?: {
    label?: string;
    position?: "left" | "right";
  };
};

export type HotkeyHandlers = Partial<Record<Hotkey, HotkeyHandlerInfo>>;

export function useHotkeys(opts: {
  handlers: HotkeyHandlers;
  enabled?: boolean;
}) {
  const { handlers, enabled = true } = opts;
  const layerContext = useHotkeyLayerContext();
  const { keyboardToHotkey, gamepadToHotkey } = useHotkeyMapping();
  const [_, setInputDevice] = useInputDeviceContext();

  const handleHotkey = useCallback(
    (
      hotkey: Hotkey,
      event?: KeyboardEvent | ReactKeyboardEvent | GamepadButtonDownEvent,
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

      if (!(event instanceof GamepadButtonDownEvent)) {
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
      const hotkey = keyboardToHotkey[pressed];

      handleHotkey(hotkey, event);
    },
    [enabled, handleHotkey, keyboardToHotkey],
  );

  const onGamepadButton = useCallback(
    (event: GamepadButtonDownEvent) => {
      const button = event.detail.button;
      const pressed = event.detail.gamepad.buttons.at(button)?.pressed;

      if (!enabled || !pressed) {
        return;
      }

      const hotkey = gamepadToHotkey[button];
      handleHotkey(hotkey, event);
    },
    [enabled, handleHotkey, gamepadToHotkey],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener(
      GamepadButtonDownEvent.EVENT_NAME,
      onGamepadButton,
    );

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener(
        GamepadButtonDownEvent.EVENT_NAME,
        onGamepadButton,
      );
    };
  }, [onKeyDown, onGamepadButton]);
}
