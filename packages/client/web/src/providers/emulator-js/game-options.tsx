import {
  useMemo,
  useState,
  createContext,
  PropsWithChildren,
  useContext,
  memo,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import { useEmulatorJS } from ".";

export type GameOptions = Readonly<{
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
  restartGame: () => void;
}>;

const GameOptionsContext = createContext<GameOptions | undefined>(undefined);

export const GameOptionsProvider = memo(function GameOptionsProvider(
  props: PropsWithChildren,
) {
  const emulatorJS = useEmulatorJS();
  const [paused, _setPaused] = useState(emulatorJS.paused);

  const setPaused: GameOptions["setPaused"] = useCallback(
    (action) => {
      _setPaused((prev) => {
        const value = typeof action === "boolean" ? action : action(prev);
        if (value) {
          emulatorJS.pause();
        } else {
          emulatorJS.play();
        }

        return value;
      });
    },
    [emulatorJS],
  );

  const restartGame = useCallback(() => {
    setPaused(true);
    emulatorJS.gameManager?.restart();
    setPaused(false);
  }, [emulatorJS.gameManager, setPaused]);

  const value: GameOptions = useMemo(
    () => ({ paused, setPaused, restartGame }),
    [paused, setPaused, restartGame],
  );

  return (
    <GameOptionsContext.Provider value={value}>
      {props.children}
    </GameOptionsContext.Provider>
  );
});

GameOptionsProvider.displayName = "GameOptionsProvider";

export function useGameOptions() {
  const ctx = useContext(GameOptionsContext);
  if (!ctx) {
    throw new Error("useGameOptions must be used within a GameOptionsProvider");
  }

  return ctx;
}
