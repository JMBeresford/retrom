import { createContext, useContext } from "react";
import type { RetromClient } from "./client";

export const context = createContext<RetromClient | undefined>(undefined);

export function useRetromClient() {
  const client = useContext(context);

  if (!client) {
    throw new Error(
      "useRetromClient must be used within a RetromClientProvider",
    );
  }

  return client;
}
