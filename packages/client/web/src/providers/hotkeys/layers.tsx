import { v4 as uuidv4 } from "uuid";
import {
  createContext,
  KeyboardEvent as ReactKeyboardEvent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  GamepadButtonToHotkey,
  Hotkey,
  HotkeyHandlerInfo,
  HotkeyHandlers,
  KeyboardHotkeyToHotkey,
} from ".";
import { GAMEPAD_BUTTON_EVENT, GamepadButtonEvent } from "../gamepad/event";
import { useInputDeviceContext } from "../input-device";

declare global {
  export interface HotkeyZones {
    global: boolean;
  }
}

export type HotkeyZone = keyof HotkeyZones;
export type HotkeyLayerState = {
  id: string;
  zones?: Partial<HotkeyZones>;
  handlers?: HotkeyHandlers;
};

export type HotkeyLayerContext = {
  setZoneActive: (zone: HotkeyZone, active: boolean) => void;
  isZoneActive: (zone?: HotkeyZone) => boolean;
  getHandler: (hotkey: Hotkey) => HotkeyHandlerInfo | undefined;
};

const hotkeyLayerContext = createContext<HotkeyLayerContext | null>(null);

type HotkeyLayerOpts = {
  /**
   * Disable this to define if/how the hotkey bubbles up to parent layers
   *
   * @default "on-misses"
   */
  allowBubbling?: "always" | "never" | "on-misses";
};

type HotkeyLayerProps = PropsWithChildren<
  HotkeyLayerOpts & Partial<HotkeyLayerState>
>;

export function HotkeyLayer(props: HotkeyLayerProps) {
  const {
    children,
    id = uuidv4(),
    zones: _zones,
    handlers = {},
    allowBubbling = "on-misses",
  } = props;

  const ref = useRef<HTMLSpanElement>(null!);
  const parent = useHotkeyLayerContext();
  const [_, setInputDevice] = useInputDeviceContext();
  const [zones, setZones] = useState(_zones ?? {});

  const setZoneActive = useCallback(
    (zone: HotkeyZone, active: boolean) => {
      setZones((prev) => ({ ...prev, [zone]: active }));
    },
    [setZones],
  );

  const getHandler = useCallback(
    (hotkey: Hotkey) => {
      return handlers[hotkey];
    },
    [handlers],
  );

  const isZoneActive = useCallback(
    (zone?: HotkeyZone) => {
      if (!zone) {
        return true;
      }

      const active = zones[zone];

      // If a layer explicitly sets a zone as active/inactive respect that
      if (active !== undefined) {
        console.log(`Layer ${id} has zone ${zone} set to ${active}`);
        return active;
      }

      // If no layer explicitly sets the zone as active/inactive default to true
      return parent?.isZoneActive(zone) ?? true;
    },
    [parent, zones, id],
  );

  const handleHotkey = useCallback(
    (
      hotkey: Hotkey,
      event: KeyboardEvent | ReactKeyboardEvent | GamepadButtonEvent,
    ) => {
      const handlerInfo = getHandler(hotkey);

      const { handler, zone } = handlerInfo ?? {};
      const zoneActive = isZoneActive(zone);

      if (handler && zoneActive) {
        console.log(
          `Layer ${id} handling hotkey ${hotkey}${zone ? ` in zone ${zone}` : ""}`,
        );

        if (event instanceof GamepadButtonEvent) {
          console.log(`Layer ${id} setting input device to gamepad`);
          setInputDevice("gamepad");
        } else {
          console.log(`Layer ${id} setting input device to hotkeys`);
          setInputDevice("hotkeys");
        }

        handler(event);
      }

      const noBubble =
        allowBubbling === "never" || (allowBubbling === "on-misses" && handler);

      const isNonNavigationalHotkey =
        hotkey !== undefined &&
        Hotkey.filter(
          (h) => !["UP", "DOWN", "LEFT", "RIGHT"].includes(h),
        ).includes(hotkey);

      if (isNonNavigationalHotkey && noBubble) {
        console.log(`Layer ${id} stopping propagation for hotkey ${hotkey}`);
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [getHandler, isZoneActive, allowBubbling, id, setInputDevice],
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      const pressed = event.key;
      const hotkey = KeyboardHotkeyToHotkey[pressed];

      handleHotkey(hotkey, event);
    },
    [handleHotkey],
  );

  const handleGamepadButton = useCallback(
    (event: GamepadButtonEvent) => {
      const button = event.detail.button;
      const pressed = !!event.detail.gamepad.buttons.at(button)?.pressed;

      if (!pressed) {
        return;
      }

      const hotkey = GamepadButtonToHotkey[button];

      handleHotkey(hotkey, event);
    },
    [handleHotkey],
  );

  useEffect(() => {
    const node = ref.current;

    node.addEventListener(GAMEPAD_BUTTON_EVENT, handleGamepadButton);

    return () => {
      node.removeEventListener(GAMEPAD_BUTTON_EVENT, handleGamepadButton);
    };
  }, [handleGamepadButton]);

  return (
    <hotkeyLayerContext.Provider
      value={{
        getHandler,
        isZoneActive,
        setZoneActive,
      }}
    >
      <span ref={ref} id={id} onKeyDown={onKeyDown} className="contents">
        {children}
      </span>
    </hotkeyLayerContext.Provider>
  );
}

export function useHotkeyLayerContext() {
  return useContext(hotkeyLayerContext);
}
