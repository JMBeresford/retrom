"use client";

import { PropsWithChildren, createContext, useContext } from "react";
import type { RetromClient } from "..";

const context = createContext<RetromClient>(null!);

export function RetromClientProvider(
  props: PropsWithChildren<{ value: RetromClient }>,
) {
  const { value, children } = props;
  return <context.Provider value={value}>{children}</context.Provider>;
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
