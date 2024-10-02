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

export type GamepadContext = {
  controllerType: "xbox" | "dualshock" | "unknown";
  gamepad: Gamepad | undefined;
};

const context = createContext<GamepadContext | undefined>(undefined);

export function GamepadProvider(props: PropsWithChildren) {
  const [gamepad, setGamepad] = useState<Gamepad | undefined>(undefined);
  const [inputCache, setInputCache] = useState<boolean[]>([]);
  const { toast } = useToast();
  const [controllerType, setControllerType] =
    useState<GamepadContext["controllerType"]>("unknown");

  const onDisconnect = useCallback(
    (e: GamepadEvent) => {
      if (gamepad && gamepad.id === e.gamepad.id) {
        setGamepad(undefined);
        toast({
          title: "Gamepad disconnected!",
        });
      }
    },
    [gamepad, toast],
  );

  const onConnect = useCallback(
    (e: GamepadEvent) => {
      const { buttons } = e.gamepad;
      setControllerType(getControllerType(e.gamepad));
      setGamepad(e.gamepad);
      setInputCache(buttons.map((b) => b.pressed));

      console.log(`Gamepad connected: ${e.gamepad.id}`);

      toast({
        title: "Gamepad connected!",
      });
    },
    [toast],
  );

  const pollGamepad = useCallback(() => {
    const pad = navigator.getGamepads()[gamepad?.index ?? 0];
    const node = document.activeElement;

    if (pad) {
      const { buttons } = pad;
      let changed = false;

      for (let i = 0; i < buttons.length; i++) {
        if (buttons.at(i)?.pressed !== inputCache.at(i)) {
          console.log(i);
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
        setInputCache(buttons.map((b) => b.pressed));
      }
    }
  }, [inputCache, gamepad]);

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

  return <context.Provider value={{ gamepad, controllerType }} {...props} />;
}

export function useGamepadContext() {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error("useGamepad must be used within a GamepadProvider");
  }

  return ctx;
}

function getControllerType(gamepad: Gamepad): GamepadContext["controllerType"] {
  const id = gamepad.id.toLowerCase();

  if (id.includes("xbox")) {
    return "xbox";
  }

  if (id.includes("dualshock")) {
    return "dualshock";
  }

  return "unknown";
}
