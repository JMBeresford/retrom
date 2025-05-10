import {
  useMemo,
  useState,
  createContext,
  PropsWithChildren,
  useContext,
  memo,
  Dispatch,
  SetStateAction,
} from "react";
import { useEmulatorJS } from ".";

export type GameOptions = Readonly<{
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
}>;

const GameOptionsContext = createContext<GameOptions | undefined>(undefined);

export const GameOptionsProvider = memo(function GameOptionsProvider(
  props: PropsWithChildren,
) {
  const emulatorJS = useEmulatorJS();
  const [paused, setPaused] = useState(emulatorJS.paused);

  const value: GameOptions = useMemo(
    () => ({ paused, setPaused }),
    [paused, setPaused],
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
