"use client";

import { PropsWithChildren, createContext, useContext } from "react";
import { RetromClient } from "./client";

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(
  props: PropsWithChildren<{ host?: string }>,
) {
  const { children } = props;

  const client = new RetromClient(props.host);

  return <context.Provider value={client}>{children}</context.Provider>;
}

export function useRetromClient() {
  const client = useContext(context);

  if (!client) {
    throw new Error(
      "useRetromClient must be used within a RetromClientProvider",
    );
  }

  return client;
}
