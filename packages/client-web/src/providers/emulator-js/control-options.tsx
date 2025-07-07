import { useToast } from "@retrom/ui/hooks/use-toast";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";
import {
  EJSControlConfig,
  EJSControls,
  GamepadHandler,
} from "@/lib/emulatorjs/gamepad";
import {
  createContext,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useEmulatorJS } from ".";

export enum Player {
  Player1,
  Player2,
  Player3,
  Player4,
}

const { Player1, Player2, Player3, Player4 } = Player;

const emptyControls = () => ({
  [Player1]: {},
  [Player2]: {},
  [Player3]: {},
  [Player4]: {},
});

export type ControlOptions = {
  player1: EJSControlConfig;
  player2: EJSControlConfig;
  player3: EJSControlConfig;
  player4: EJSControlConfig;
  setBindings: (player: Player, bindings: EJSControlConfig) => void;
  labels: {
    id: string;
    label: string;
  }[];
  resetControls: (player?: Player) => void;
  keyLookup: EmulatorJS["keyLookup"];
  getKeyLabel: (key: number) => string;
  getButtonLabel: GamepadHandler["getButtonLabel"];
  pauseInput: () => void;
  resumeInput: () => void;
};

const ControlOptionsContext = createContext<ControlOptions | undefined>(
  undefined,
);

export function ControlOptionsProvider(props: PropsWithChildren) {
  const { toast } = useToast();
  const emulatorJS = useEmulatorJS();
  const defaults = useMemo(
    () =>
      JSON.parse(JSON.stringify(emulatorJS.defaultControllers)) as EJSControls,
    [emulatorJS],
  );

  const [player1, setPlayer1] = useState(
    emulatorJS.controls?.[Player1] ?? emulatorJS.defaultControllers[0] ?? {},
  );
  const [player2, setPlayer2] = useState(
    emulatorJS.controls?.[Player2] ?? emulatorJS.defaultControllers[1] ?? {},
  );
  const [player3, setPlayer3] = useState(
    emulatorJS.controls?.[Player3] ?? emulatorJS.defaultControllers[2] ?? {},
  );
  const [player4, setPlayer4] = useState(
    emulatorJS.controls?.[Player4] ?? emulatorJS.defaultControllers[3] ?? {},
  );

  // Hacky as all hell, no other way to leverage the existing
  // per-core button labeling emulatorJS does under the hood
  const labels = useMemo(() => {
    const elements = [
      ...emulatorJS.controlMenu
        .querySelectorAll('.ejs_control_body .ejs_control_bar[data-index="0"]')
        .values(),
    ];

    const labelsById: { id: string; label: string }[] = [];
    for (const el of elements) {
      const label = el.attributes.getNamedItem("data-label")?.value;
      const id = el.attributes.getNamedItem("data-id")?.value;

      if (id && label) {
        labelsById.push({ id, label });
      }
    }

    return labelsById;
  }, [emulatorJS]);

  const setBindings: ControlOptions["setBindings"] = useCallback(
    (player, bindings) => {
      const cb: SetStateAction<EJSControls[Player]> = (prev) => {
        const newBindings = { ...prev };
        for (const _key in bindings) {
          const key = _key as keyof EJSControlConfig;
          const binding = bindings[key];

          if (binding) {
            newBindings[key] = {
              ...newBindings[key],
              ...binding,
            };
          }
        }

        if (!emulatorJS.controls) {
          emulatorJS.controls = emptyControls();
        }

        emulatorJS.controls[player] = newBindings;
        emulatorJS.setupKeys();
        emulatorJS.checkGamepadInputs();
        emulatorJS.saveSettings();

        return emulatorJS.controls[player];
      };

      switch (player) {
        case Player1:
          setPlayer1(cb);
          break;
        case Player2:
          setPlayer2(cb);
          break;
        case Player3:
          setPlayer3(cb);
          break;
        case Player4:
          setPlayer4(cb);
          break;
        default:
          throw new Error("Invalid player");
      }
    },
    [emulatorJS],
  );

  const resetControls = useCallback(
    (player?: Player) => {
      try {
        if (player !== undefined) {
          setBindings(player, defaults[player]);
        } else {
          setBindings(Player1, defaults[Player1]);
          setBindings(Player2, defaults[Player2]);
          setBindings(Player3, defaults[Player3]);
          setBindings(Player4, defaults[Player4]);
        }

        toast({
          title: "Controls Reset",
          description: "Controls have been reset to their default values.",
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Reset Controls Error",
          description:
            "An error occurred while resetting controls, please refresh and try again.",
          variant: "destructive",
        });
      }
    },
    [toast, defaults, setBindings],
  );

  const keyLookup: ControlOptions["keyLookup"] = useCallback(
    (key) => emulatorJS.keyLookup(key),
    [emulatorJS],
  );

  const getKeyLabel: ControlOptions["getKeyLabel"] = useCallback(
    (key) => {
      return emulatorJS.keyMap[key];
    },
    [emulatorJS],
  );

  const getButtonLabel: GamepadHandler["getButtonLabel"] = useCallback(
    (index) => emulatorJS.gamepad.getButtonLabel(index),
    [emulatorJS],
  );

  const pauseInput = useCallback(() => {
    emulatorJS.gamepad.on("axischanged", () => {});
    emulatorJS.gamepad.on("buttondown", () => {});
    emulatorJS.gamepad.on("buttonup", () => {});
  }, [emulatorJS]);

  const resumeInput = useCallback(() => {
    emulatorJS.gamepad.on(
      "axischanged",
      emulatorJS.gamepadEvent.bind(emulatorJS),
    );
    emulatorJS.gamepad.on(
      "buttondown",
      emulatorJS.gamepadEvent.bind(emulatorJS),
    );
    emulatorJS.gamepad.on("buttonup", emulatorJS.gamepadEvent.bind(emulatorJS));
  }, [emulatorJS]);

  const value: ControlOptions = useMemo(
    () => ({
      player1,
      player2,
      player3,
      player4,
      labels,
      resetControls,
      setBindings,
      keyLookup,
      getKeyLabel,
      getButtonLabel,
      pauseInput,
      resumeInput,
    }),
    [
      player1,
      player2,
      player3,
      player4,
      labels,
      resetControls,
      setBindings,
      keyLookup,
      getKeyLabel,
      getButtonLabel,
      pauseInput,
      resumeInput,
    ],
  );

  return (
    <ControlOptionsContext.Provider value={value}>
      {props.children}
    </ControlOptionsContext.Provider>
  );
}

export function useControlOptions() {
  const ctx = useContext(ControlOptionsContext);

  if (!ctx) {
    throw new Error(
      "useControlOptions must be used within a ControlOptionsProvider",
    );
  }

  return ctx;
}

export function usePlayerControls(player: Player) {
  const { player1, player2, player3, player4 } = useControlOptions();

  const bindings = useMemo(() => {
    switch (player) {
      case Player1:
        return player1;
      case Player2:
        return player2;
      case Player3:
        return player3;
      case Player4:
        return player4;
      default:
        throw new Error("Invalid player");
    }
  }, [player, player1, player2, player3, player4]);

  return bindings;
}
