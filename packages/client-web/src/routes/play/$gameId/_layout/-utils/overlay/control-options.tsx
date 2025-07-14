import { ConfigCheckbox } from "@/components/fullscreen/menubar/config-inputs/checkbox";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { Label } from "@retrom/ui/components/label";
import { toast } from "@retrom/ui/hooks/use-toast";
import { EmulatorJSControlMap } from "@/lib/emulatorjs/gamepad";
import { toTitleCase } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useEmulatorJS } from "@/providers/emulator-js";
import {
  Player,
  useControlOptions,
  usePlayerControls,
} from "@/providers/emulator-js/control-options";
import {
  GamepadButtonDownEvent,
  GamepadAxisActiveEvent,
} from "@/providers/gamepad/event";
import { KeyboardIcon, Gamepad2Icon } from "lucide-react";
import {
  KeyboardEvent,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { OverlayMenuItem } from ".";
import { useGamepadContext } from "@/providers/gamepad";

const gamepadEvents = [GamepadButtonDownEvent, GamepadAxisActiveEvent] as const;

const { Player1, Player2, Player3, Player4 } = Player;

export const controlOptions: OverlayMenuItem = {
  label: "Control Options",
  items: [
    {
      label: "Player Bindings",
      groupItems: [
        {
          label: "Player 1",
          items: [{ Render: () => <PlayerBindings player={Player1} /> }],
        },
        {
          label: "Player 2",
          items: [{ Render: () => <PlayerBindings player={Player2} /> }],
        },
        {
          label: "Player 3",
          items: [{ Render: () => <PlayerBindings player={Player3} /> }],
        },
        {
          label: "Player 4",
          items: [{ Render: () => <PlayerBindings player={Player4} /> }],
        },
      ],
    },
    {
      label: "Other Control Options",
      groupItems: [
        { label: "Virtual Gamepad", Render: VirtualGamepad },
        {
          label: "Reset Controls",
          Render: ResetControls,
        },
      ],
    },
  ],
};

function VirtualGamepad() {
  const emulatorJS = useEmulatorJS();
  const [enabled, setEnabled] = useState(
    emulatorJS.settings["virtual-gamepad"] === "enabled",
  );

  return (
    <ConfigCheckbox
      id="virtual-gamepad-enabled"
      label="Virtual Gamepad"
      checked={enabled}
      onCheckedChange={(v) => {
        const value = v ? "enabled" : "disabled";
        emulatorJS.changeSettingOption("virtual-gamepad", value);
        emulatorJS.menuOptionChanged("virtual-gamepad", value);

        setEnabled(!!v);
      }}
    >
      Enables the on-screen gamepad
    </ConfigCheckbox>
  );
}

function ResetControls() {
  const { resetControls } = useControlOptions();
  return (
    <MenuEntryButton
      id="control-options-reset"
      className="text-base"
      onClick={() => resetControls()}
      label="This will set all bindings to default values"
    >
      Reset Controls
    </MenuEntryButton>
  );
}

function PlayerBindings(props: { player: Player }) {
  const { player } = props;
  const { labels } = useControlOptions();
  const { gamepads } = useGamepadContext();
  const connectedGamepad = gamepads?.at(player);

  return (
    <div
      className={cn(
        "grid grid-cols-[min-content_1fr_1fr] auto-rows-fr w-fit h-full",
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
          <KeyboardIcon size={24} />
        </Label>
        <Label className="flex gap-2 overflow-hidden w-full max-w-full">
          <Gamepad2Icon size={24} className="min-w-min" />
          <span className="text-sm muted font-light text-nowrap overflow-hidden text-ellipsis w-min">
            {connectedGamepad?.gamepad.id}
          </span>
        </Label>
      </div>

      {labels.map(({ id, label }) => {
        const buttonId = id as keyof EmulatorJSControlMap;

        return (
          <div
            key={id}
            className={cn(
              "grid grid-cols-subgrid grid-rows-subgrid col-span-3 items-baseline",
              "even:bg-white/[0.015] *:pt-0 items-stretch pr-2",
            )}
          >
            <div className="border-r px-4 flex items-center">
              <p className="text-sm text-muted-foreground font-medium">
                {toTitleCase(label)}
              </p>
            </div>

            <RecordInput player={player} buttonId={buttonId} />
            <RecordInput player={player} buttonId={buttonId} gamepad />
          </div>
        );
      })}
    </div>
  );
}

const RecordInput = memo(function RecordInput(props: {
  player: Player;
  buttonId: keyof EmulatorJSControlMap;
  gamepad?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const { player, buttonId, gamepad } = props;
  const { gamepads } = useGamepadContext();
  const { setBindings, keyLookup, getKeyLabel, getButtonLabel, getAxisLabel } =
    useControlOptions();
  const bindings = usePlayerControls(player);

  const connectedGamepad = gamepads?.at(0);

  const value = useMemo(() => {
    const values = bindings[buttonId];

    if (gamepad) {
      return values?.value2 ?? "";
    }

    return values?.value !== undefined
      ? getKeyLabel(values.value).toString()
      : "";
  }, [bindings, buttonId, gamepad, getKeyLabel]);

  const setBinding = useCallback(
    (value: string) => {
      const key = gamepad ? "value2" : "value";

      return setBindings(player, { [buttonId]: { [key]: value } });
    },
    [gamepad, setBindings, buttonId, player],
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

      const ejsKey = Number(keyLookup(binding));
      if (ejsKey > 0) {
        setBinding(binding);
      } else {
        toast({
          title: "Invalid key",
          description: "Please select a different key",
          variant: "destructive",
        });
      }
    },
    [recording, setBinding, gamepad, keyLookup],
  );

  const handleGamepad = useCallback(
    (e: InstanceType<(typeof gamepadEvents)[number]>) => {
      if (!recording || !gamepad) return;

      e.stopPropagation();

      if (e instanceof GamepadButtonDownEvent) {
        const { button } = e.detail;

        const label = getButtonLabel(button);
        if (label) {
          setBinding(label);
        }
        setRecording(false);
      } else if (e instanceof GamepadAxisActiveEvent) {
        const { axis, value } = e.detail;

        const label = getAxisLabel(axis, value);
        if (label) {
          setBinding(label);
        }
        setRecording(false);
      }
    },
    [recording, gamepad, setBinding, getButtonLabel, getAxisLabel],
  );

  useLayoutEffect(() => {
    if (recording) {
      gamepadEvents.forEach((event) => {
        window.addEventListener(event.EVENT_NAME, handleGamepad, {
          capture: true,
        });
      });
    } else {
      gamepadEvents.forEach((event) => {
        window.removeEventListener(event.EVENT_NAME, handleGamepad, {
          capture: true,
        });
      });
    }

    return () => {
      gamepadEvents.forEach((event) => {
        window.removeEventListener(event.EVENT_NAME, handleGamepad, {
          capture: true,
        });
      });
    };
  }, [handleGamepad, recording]);

  const label = useMemo(() => toTitleCase(value.replaceAll("_", " ")), [value]);
  const id = `key-recorder-${player}-${buttonId}${gamepad ? "-gamepad" : ""}`;

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
      {recording ? "recording..." : label || "-"}
    </MenuEntryButton>
  );
});
