import { useToast } from "@/components/ui/use-toast";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { GamepadButtonEvent } from "./event";
import { ControllerMapping, getControllerMapping } from "./controller-ids";

export type GamepadContext = {
  controllerType: ControllerMapping;
  gamepad: Gamepad | undefined;
};

const context = createContext<GamepadContext | undefined>(undefined);

export function GamepadProvider(props: PropsWithChildren) {
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [inputCache, setInputCache] = useState<Map<number, boolean[]>>(
    new Map(),
  );

  const { toast } = useToast();
  const [controllerMapping, setControllerMapping] =
    useState<ControllerMapping>("xbox");

  const onDisconnect = useCallback(
    (e: GamepadEvent) => {
      if (gamepads.some((pad) => pad.id === e.gamepad.id)) {
        setGamepads((prev) => prev.filter((pad) => pad.id !== e.gamepad.id));

        const mapping = getControllerMapping(e.gamepad);

        toast({
          title: "Gamepad disconnected",
          description: `Your ${mapping} controller has been disconnected`,
        });
      }
    },
    [gamepads, toast],
  );

  const onConnect = useCallback(
    (e: GamepadEvent) => {
      const { buttons, index } = e.gamepad;
      const mapping = getControllerMapping(e.gamepad);
      setControllerMapping(mapping);
      setGamepads((prev) => [...prev, e.gamepad]);
      const inputs = buttons.map((b) => b.pressed);
      setInputCache((map) => map.set(index, inputs));

      console.log(`Gamepad connected: ${e.gamepad.id}`);

      toast({
        title: "Gamepad connected",
        description: `Now using your ${mapping} controller`,
      });
    },
    [toast],
  );

  const pollGamepad = useCallback(() => {
    const node = document.activeElement;

    for (const connectedPad of gamepads) {
      const pad = navigator.getGamepads().at(connectedPad.index);

      if (pad) {
        const { buttons, index } = pad;
        const currentInputs = inputCache.get(index);
        let changed = false;

        for (let i = 0; i < buttons.length; i++) {
          if (buttons.at(i)?.pressed !== currentInputs?.at(i)) {
            changed = true;

            node?.dispatchEvent(
              new GamepadButtonEvent({
                gamepad: pad,
                button: i,
              }),
            );
          }
        }

        if (changed) {
          const inputs = buttons.map((b) => b.pressed);
          setInputCache((map) => map.set(index, inputs));
          const mapping = getControllerMapping(pad);
          setControllerMapping(mapping);
        }
      }
    }
  }, [inputCache, gamepads]);

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
      value={{ gamepad: gamepads, controllerType: controllerMapping }}
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
