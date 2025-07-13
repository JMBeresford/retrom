import { useToast } from "@retrom/ui/hooks/use-toast";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GamepadButtonUpEvent,
  GamepadButtonDownEvent,
  GamepadAxisActiveEvent,
  GamepadAxisInactiveEvent,
} from "./event";
import { getControllerMapping } from "./controller-ids";
import { ControllerMapping } from "./maps";

export interface RetromGamepad {
  gamepad: Gamepad;
  controllerType: ControllerMapping;
}

export type GamepadContext = {
  gamepads: RetromGamepad[] | undefined;
};

type GamepadInputCache = {
  /** Map of gamepad index to button states */
  buttons: Map<number, boolean[]>;

  /** Map of gamepad index to axes states */
  axes: Map<number, number[]>;
};

const context = createContext<GamepadContext | undefined>(undefined);

export function GamepadProvider(props: PropsWithChildren) {
  const [gamepads, setGamepads] = useState<RetromGamepad[]>([]);
  const [inputCache, setInputCache] = useState<GamepadInputCache>({
    buttons: new Map(),
    axes: new Map(),
  });

  const { toast } = useToast();

  const onDisconnect = useCallback(
    (e: GamepadEvent) => {
      if (gamepads.some(({ gamepad }) => gamepad.id === e.gamepad.id)) {
        setGamepads((prev) =>
          prev.filter(({ gamepad }) => gamepad.id !== e.gamepad.id),
        );

        const mapping = getControllerMapping(e.gamepad);

        toast({
          title: "Gamepad disconnected",
          description: `Your ${mapping} controller has been disconnected`,
        });
      }
    },
    [gamepads, toast],
  );

  const pollGamepad = useCallback(() => {
    const node = document.activeElement;

    for (const connectedPad of gamepads) {
      const pad = navigator.getGamepads().at(connectedPad.gamepad.index);

      if (pad) {
        const { buttons, index } = pad;
        const currentButtonInputs = inputCache.buttons.get(index);
        let changed = false;

        for (let i = 0; i < buttons.length; i++) {
          const currentlyPressed = buttons.at(i)?.pressed;
          const previouslyPressed = currentButtonInputs?.at(i);

          if (
            currentlyPressed !== previouslyPressed &&
            currentlyPressed !== undefined
          ) {
            changed = true;

            if (currentlyPressed) {
              node?.dispatchEvent(
                new GamepadButtonDownEvent({
                  gamepad: pad,
                  button: i,
                }),
              );
            } else {
              node?.dispatchEvent(
                new GamepadButtonUpEvent({
                  gamepad: pad,
                  button: i,
                }),
              );
            }
          }
        }

        for (let i = 0; i < pad.axes.length; i++) {
          const value = pad.axes.at(i) ?? 0;
          const cachedValue = inputCache.axes.get(index)?.at(i) ?? 0;
          const currentlyActive = value >= 0.5;
          const previouslyActive = cachedValue >= 0.5;

          if (currentlyActive !== previouslyActive) {
            changed = true;

            if (currentlyActive) {
              node?.dispatchEvent(
                new GamepadAxisActiveEvent({
                  gamepad: pad,
                  axis: i,
                  value,
                }),
              );
            } else {
              node?.dispatchEvent(
                new GamepadAxisInactiveEvent({
                  gamepad: pad,
                  axis: i,
                  value,
                }),
              );
            }
          }
        }

        if (changed) {
          const buttonInputs = buttons.map((b) => b.pressed);
          const axesInputs = pad.axes.map((a) => a);
          setInputCache((cache) => {
            cache.buttons.set(index, buttonInputs);
            cache.axes.set(index, axesInputs);

            return { ...cache };
          });
        }
      }
    }
  }, [inputCache, gamepads]);

  const onConnect = useCallback(
    (e: GamepadEvent) => {
      const mapping = getControllerMapping(e.gamepad);
      const pad: RetromGamepad = {
        gamepad: e.gamepad,
        controllerType: mapping,
      };

      setGamepads((prev) => [...prev, pad]);
      pollGamepad();

      console.log(`Gamepad connected: ${e.gamepad.id}`);

      toast({
        title: "Gamepad connected",
        description: `Now using your ${mapping} controller`,
      });
    },
    [toast, pollGamepad],
  );

  useEffect(() => {
    let frame: number;

    const loop = () => {
      pollGamepad();
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);

    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);

    return () => {
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
      cancelAnimationFrame(frame);
    };
  }, [onDisconnect, onConnect, pollGamepad]);

  return (
    <context.Provider
      value={useMemo(() => ({ gamepads }), [gamepads])}
      {...props}
    />
  );
}

export function useGamepadContext() {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error("useGamepad must be used within a GamepadProvider");
  }

  return ctx;
}
