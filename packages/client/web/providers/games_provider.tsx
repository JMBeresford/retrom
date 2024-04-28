"use client";

import { GameServiceClient, GameServiceDefinition } from "@/generated/retrom";
import { createChannel, createClient } from "nice-grpc-web";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";

const context = createContext<GameServiceClient | undefined>(undefined);

export function GameClientProvider({ children }: { children: ReactNode }) {
  const channel = useMemo(() => createChannel("http://localhost:5001"), []);
  const [client] = useState<GameServiceClient>(() =>
    createClient(GameServiceDefinition, channel),
  );

  return <context.Provider value={client}>{children}</context.Provider>;
}

export function useGameClient() {
  const client = useContext(context);

  if (!client) {
    throw new Error("useGameClient must be used within GameClientProvider");
  }

  return client;
}
