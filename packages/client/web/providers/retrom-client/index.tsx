"use client";

import {
  EmulatorServiceClient,
  GameServiceClient,
  LibraryServiceClient,
  MetadataServiceClient,
  PlatformServiceClient,
} from "@/generated/retrom/services";
import { RetromDesktopClient } from "./desktop";
import { PropsWithChildren, createContext, useContext } from "react";

export interface RetromClient {
  readonly libraryClient: LibraryServiceClient;
  readonly platformClient: PlatformServiceClient;
  readonly gameClient: GameServiceClient;
  readonly metadataClient: MetadataServiceClient;
  readonly emulatorClient: EmulatorServiceClient;
}

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(
  props: PropsWithChildren<{ value?: RetromClient }>,
) {
  const { value, children } = props;

  const client = value ?? new RetromDesktopClient();

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
