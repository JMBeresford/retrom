"use client";

import {
  PlatformServiceClient,
  PlatformServiceDefinition,
} from "@/generated/retrom";
import { createChannel, createClient } from "nice-grpc-web";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";

const context = createContext<PlatformServiceClient | undefined>(undefined);

export function PlatformClientProvider({ children }: { children: ReactNode }) {
  const channel = useMemo(() => createChannel("http://localhost:5001"), []);
  const [client] = useState<PlatformServiceClient>(() =>
    createClient(PlatformServiceDefinition, channel),
  );

  return <context.Provider value={client}>{children}</context.Provider>;
}

export function usePlatformClient() {
  const client = useContext(context);

  if (!client) {
    throw new Error(
      "usePlatformClient must be used within PlatformClientProvider",
    );
  }

  return client;
}
