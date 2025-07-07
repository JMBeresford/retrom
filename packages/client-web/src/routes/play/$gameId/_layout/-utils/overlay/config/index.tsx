import { useHotkeyMapping } from "@/providers/hotkeys/mapping";
import { OverlayMenuItem } from "..";
import { Hotkey } from "@/providers/hotkeys";
import { toTitleCase } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { Label } from "@retrom/ui/components/label";
import { Gamepad2, Keyboard } from "lucide-react";
import { KeyboardEvent, useCallback, useLayoutEffect, useState } from "react";
import {
  GAMEPAD_BUTTON_EVENT,
  GamepadButtonEvent,
} from "@/providers/gamepad/event";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { useGamepadContext } from "@/providers/gamepad";
import { getButtonMapValue } from "@/providers/gamepad/maps";

export const configOptions: OverlayMenuItem = {
  label: "Retrom Configuration",
  items: [
    {
      label: "Gamepad and Hotkeys",
      labelSub: "Configure gamepad and hotkey bindings",
      items: [{ Render: () => <GamepadHotkeysRender /> }],
    },
  ],
};

function GamepadHotkeysRender() {
  const { gamepads } = useGamepadContext();
  const connectedGamepad = gamepads?.at(0);

  return (
    <div
      className={cn(
        "grid grid-cols-[min-content,1fr,1fr] auto-rows-fr w-full h-full",
      )}
    >
      <div
        className={cn(
          "grid grid-cols-subgrid grid-rows-subgrid col-span-3",
          "pb-2 border-b",
          "*:text-lg *:font-medium *:pl-3",
          "*:flex *:items-center *:min-w-24",
        )}
      >
        <Label></Label>
        <Label>
          <Keyboard size={24} />
        </Label>
        <Label className="overflow-hidden w-fit max-w-full">
          <Gamepad2 size={24} className="min-w-min" />
          <span className="pl-2 text-sm muted font-light text-nowrap overflow-hidden text-ellipsis w-min">
            {connectedGamepad?.gamepad.id}
          </span>
        </Label>
      </div>
      {Hotkey.map((hotkey) => (
        <div
          key={hotkey}
          className={cn(
            "grid grid-cols-subgrid grid-rows-subgrid col-span-3 items-baseline",
            "even:bg-white/[0.015] *:pt-0 items-stretch pr-2",
          )}
        >
          <div className="border-r px-4 flex items-center">
            <p className="text-sm text-muted-foreground font-medium">
              {toTitleCase(hotkey.replace("_", " "))}:
            </p>
          </div>

          <RecordInput hotkey={hotkey} />
          <RecordInput hotkey={hotkey} gamepad />
        </div>
      ))}
    </div>
  );
}

const RecordInput = function RecordInput(props: {
  hotkey: Hotkey;
  gamepad?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const { hotkey, gamepad } = props;
  const { gamepads } = useGamepadContext();
  const {
    hotkeyToKeyboard,
    hotkeyToGamepadButton,
    setGamepadMap,
    setKeyboardMap,
  } = useHotkeyMapping();

  const connectedGamepad = gamepads?.at(0);

  const value = gamepad
    ? getButtonMapValue(
        hotkeyToGamepadButton[hotkey],
        connectedGamepad?.controllerType,
      )
    : hotkeyToKeyboard[hotkey];

  const setBinding = useCallback(
    (value: number | string) => {
      if (gamepad) {
        setGamepadMap((prev) => ({ ...prev, [hotkey]: value }));
      } else {
        setKeyboardMap((prev) => ({ ...prev, [hotkey]: value }));
      }
    },
    [gamepad, setGamepadMap, setKeyboardMap, hotkey],
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!recording || gamepad) return;
      e.preventDefault();
      e.stopPropagation();

      setRecording(false);
      let binding = "";
      switch (e.key.toLowerCase()) {
        case " ":
          binding = "Space";
          break;
        case "meta":
          binding =
            e.code.toLowerCase() === "metaleft"
              ? "left window key"
              : "right window key";
          break;
        default:
          binding = e.key;
          break;
      }

      setBinding(binding);
    },
    [recording, setBinding, gamepad],
  );

  const handleGamepad = useCallback(
    (e: GamepadButtonEvent) => {
      if (!recording || !gamepad) return;

      e.stopPropagation();

      const { button } = e.detail;
      if (!e.detail.gamepad.buttons[button]?.pressed) return;

      setRecording(false);
      setBinding(button);
    },
    [recording, gamepad, setBinding],
  );

  useLayoutEffect(() => {
    if (recording) {
      window.addEventListener(GAMEPAD_BUTTON_EVENT, handleGamepad, {
        capture: true,
      });
    } else {
      window.removeEventListener(GAMEPAD_BUTTON_EVENT, handleGamepad, {
        capture: true,
      });
    }

    return () => {
      window.removeEventListener(GAMEPAD_BUTTON_EVENT, handleGamepad, {
        capture: true,
      });
    };
  }, [handleGamepad, recording]);

  const id = `key-recorder-${hotkey}${gamepad ? "-gamepad" : ""}`;

  const record = useCallback(() => {
    if (recording) return;
    setRecording(true);
  }, [recording]);

  return (
    <MenuEntryButton
      id={id}
      disabled={gamepad && !connectedGamepad}
      handlers={{
        ACCEPT: {
          handler: record,
          actionBar: {
            label: "Record",
          },
        },
        OPTION: {
          handler: () => setBinding(""),
          actionBar: {
            label: "Clear",
          },
        },
      }}
      onClick={record}
      onBlur={() => {
        setRecording(false);
      }}
      onKeyDown={handleKey}
      className={cn(
        "text-base font-normal items-center pr-3 h-full",
        "justify-start text-left whitespace-normal",
        recording && "text-accent-text text-sm italic animate-pulse",
      )}
    >
      {recording ? "recording..." : (value ?? "-")}
    </MenuEntryButton>
  );
};
