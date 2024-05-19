"use client";

import { Game, GameMetadata, Platform } from "@/generated/retrom";
import { PropsWithChildren, createContext, useContext } from "react";

type GameDetailContext = {
  game: Game;
  platform?: Platform;
  metadata?: GameMetadata;
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
