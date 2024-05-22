"use client";

import {
  Game,
  GameMetadata,
  Platform,
  PlatformMetadata,
} from "@/generated/retrom";
import { PropsWithChildren, createContext, useContext } from "react";

export type GameDetailContext = {
  game: Game;
  platform?: Platform;
  gameMetadata?: GameMetadata;
  platformMetadata?: PlatformMetadata;
};

const GameDetailContext = createContext<GameDetailContext | null>(null);

export function GameDetailProvider(
  props: PropsWithChildren<{ value: GameDetailContext }>,
) {
  const { value, children } = props;

  return (
    <GameDetailContext.Provider value={value}>
      {children}
    </GameDetailContext.Provider>
  );
}

export function useGameDetail() {
  const context = useContext(GameDetailContext);

  if (!context) {
    throw new Error("useGameDetail must be used within a GameDetailProvider");
  }

  return context;
}
