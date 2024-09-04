import { create, StoreApi, UseBoundStore } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { RetromClientConfig } from "@/generated/retrom/client/client-config";
import { createContext, PropsWithChildren, useContext } from "react";
import { DeepRequired } from "@/lib/utils";
import { defaultAPIHostname, defaultAPIPort } from "./utils";
import { Timestamp } from "@/generated/google/protobuf/timestamp";
import { useLocation, useNavigate } from "@tanstack/react-router";

const STORAGE_KEY = "retrom-client-config";
type LocalConfig = DeepRequired<RetromClientConfig>;

const context = createContext<UseBoundStore<StoreApi<LocalConfig>> | undefined>(
  undefined,
);

export function ConfigProvider(props: PropsWithChildren<{}>) {
  const { children } = props;
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });

  const configStore = create<LocalConfig>()(
    subscribeWithSelector(
      persist(() => defaultConfig, { name: STORAGE_KEY, version: 1 }),
    ),
  );

  const initialConfig = configStore.getState();

  if (!initialConfig?.flowCompletions.setupComplete && pathname !== "/setup") {
    navigate({ to: "/setup" });
  }

  return <context.Provider value={configStore}>{children}</context.Provider>;
}

export function useConfig() {
  const store = useContext(context);

  if (!store) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  return store;
}

const defaultConfig: DeepRequired<RetromClientConfig> = {
  server: { hostname: defaultAPIHostname(), port: defaultAPIPort() },
  config: {
    clientInfo: {
      name: "",
      id: -1,
      createdAt: Timestamp.create(),
      updatedAt: Timestamp.create(),
    },
  },
  flowCompletions: {
    setupComplete: false,
  },
};
