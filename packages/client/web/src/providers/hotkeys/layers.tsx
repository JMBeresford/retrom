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
  useMemo,
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
import { cn } from "@/lib/utils";

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
  parentLayer?: HotkeyLayerState;
};

export type FocusedHotkeyLayerContext = {
  focusedHotkeyLayer?: HotkeyLayerState;
  layerFocused: (layer: HotkeyLayerState) => boolean;
  layerBlurred: (layer: HotkeyLayerState) => boolean;
};

export type HotkeyLayerContext = {
  setZoneActive: (zone: HotkeyZone, active: boolean) => void;
  isZoneActive: (zone?: HotkeyZone) => boolean;
  getHandler: (hotkey: Hotkey) => HotkeyHandlerInfo | undefined;
  layer: HotkeyLayerState;
};

const FocusedHotkeyLayerContext = createContext<
  FocusedHotkeyLayerContext | undefined
>(undefined);

const HotkeyLayerContext = createContext<HotkeyLayerContext | undefined>(
  undefined,
);

type HotkeyLayerOpts = {
  /**
   * Disable this to define if/how the hotkey bubbles up to parent layers
   *
   * @default "on-misses"
   */
  allowBubbling?: "always" | "never" | "on-misses";
};

export type HotkeyLayerProps = JSX.IntrinsicElements["span"] &
  HotkeyLayerOpts &
  Partial<HotkeyLayerState>;

export function FocusedHotkeyLayerProvider(props: PropsWithChildren) {
  const [focusedHotkeyLayer, setFocusedHotkeyLayer] = useState<
    HotkeyLayerState | undefined
  >();

  const layerFocused = useCallback(
    (layer: HotkeyLayerState) => {
      if (layer.id !== focusedHotkeyLayer?.id) {
        setFocusedHotkeyLayer(layer);
        return true;
      }

      return false;
    },
    [focusedHotkeyLayer?.id],
  );

  const layerBlurred = useCallback(
    (layer: HotkeyLayerState) => {
      if (layer.id === focusedHotkeyLayer?.id) {
        setFocusedHotkeyLayer(undefined);
        return true;
      }

      return false;
    },
    [focusedHotkeyLayer?.id],
  );

  const value: FocusedHotkeyLayerContext = useMemo(
    () => ({
      focusedHotkeyLayer,
      layerFocused,
      layerBlurred,
    }),
    [focusedHotkeyLayer, layerFocused, layerBlurred],
  );

  return (
    <FocusedHotkeyLayerContext.Provider value={value}>
      {props.children}
    </FocusedHotkeyLayerContext.Provider>
  );
}

export function useFocusedHotkeyLayer() {
  const context = useContext(FocusedHotkeyLayerContext);

  if (!context) {
    throw new Error(
      "useFocusedHotkeyLayer must be used within a FocusedHotkeyLayerProvider",
    );
  }

  return context;
}

export function HotkeyLayer(props: HotkeyLayerProps) {
  const {
    children,
    id = uuidv4(),
    zones: _zones,
    handlers = {},
    allowBubbling = "on-misses",
    className,
    ...rest
  } = props;

  const ref = useRef<HTMLSpanElement>(null!);
  const parent = useHotkeyLayerContext();
  const [_, setInputDevice] = useInputDeviceContext();
  const [zones, setZones] = useState(_zones ?? {});
  const { layerBlurred, layerFocused } = useFocusedHotkeyLayer();

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
        return active;
      }

      // If no layer explicitly sets the zone as active/inactive default to true
      return parent?.isZoneActive(zone) ?? true;
    },
    [parent, zones],
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
        if (event instanceof GamepadButtonEvent) {
          setInputDevice("gamepad");
        } else {
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
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [getHandler, isZoneActive, allowBubbling, setInputDevice],
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

  const layer: HotkeyLayerState = useMemo(
    () => ({
      id,
      zones,
      handlers,
      parentLayer: parent?.layer,
    }),
    [id, zones, handlers, parent],
  );

  const value: HotkeyLayerContext = useMemo(
    () => ({
      getHandler,
      isZoneActive,
      setZoneActive,
      layer,
    }),
    [getHandler, isZoneActive, setZoneActive, layer],
  );

  return (
    <HotkeyLayerContext.Provider value={value}>
      <span
        ref={ref}
        id={id}
        onKeyDown={onKeyDown}
        className={cn("contents", className)}
        onFocus={(e) => {
          if (layerFocused(layer)) {
            e.stopPropagation();
          }
        }}
        onBlur={(e) => {
          if (layerBlurred(layer)) {
            e.stopPropagation();
          }
        }}
        {...rest}
      >
        {children}
      </span>
    </HotkeyLayerContext.Provider>
  );
}

export function useHotkeyLayerContext() {
  return useContext(HotkeyLayerContext);
}
