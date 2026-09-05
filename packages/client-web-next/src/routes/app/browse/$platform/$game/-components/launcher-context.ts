import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export type LauncherContextValue = {
  gameId: string;
  platformId: string;
  emulatorId?: string;
  emulatorProfileId?: string;
};

export const LauncherContext = createContext<
  | [
      state: LauncherContextValue,
      setState: Dispatch<SetStateAction<LauncherContextValue>>,
    ]
  | null
>(null);

export function useLauncherContext() {
  const context = useContext(LauncherContext);

  if (!context) {
    throw new Error(
      "useLauncherContext must be used within a LauncherContextProvider",
    );
  }

  return context;
}
