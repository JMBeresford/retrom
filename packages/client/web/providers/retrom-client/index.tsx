"use client";

import { PropsWithChildren, createContext, useContext } from "react";
import { RetromClient } from "./client";
import { useConfig } from "../config";
import { LoaderCircleIcon } from "lucide-react";

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(props: PropsWithChildren<{}>) {
  const { config } = useConfig();
  const { children } = props;

  if (config.status === "pending") {
    return <LoaderCircleIcon />;
  }

  if (config.status === "error") {
    return <div>Failed to load config</div>;
  }

  const host = `${config.data.server?.hostname}:${config.data.server?.port}`;

  const client = new RetromClient(host);

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
