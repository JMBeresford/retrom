"use client";

import { PropsWithChildren, createContext, useContext } from "react";
import { createChannel, createClient } from "nice-grpc-web";
import {
  EmulatorServiceDefinition,
  LibraryServiceDefinition,
  GameServiceDefinition,
  PlatformServiceDefinition,
  MetadataServiceDefinition,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";

export class RetromClient {
  public gameClient = createClient(
    GameServiceDefinition,
    createChannel(GRPC_HOST),
  );

  public platformClient = createClient(
    PlatformServiceDefinition,
    createChannel(GRPC_HOST),
  );

  public emulatorClient = createClient(
    EmulatorServiceDefinition,
    createChannel(GRPC_HOST),
  );

  public metadataClient = createClient(
    MetadataServiceDefinition,
    createChannel(GRPC_HOST),
  );

  public libraryClient = createClient(
    LibraryServiceDefinition,
    createChannel(GRPC_HOST),
  );
}

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(props: PropsWithChildren<{}>) {
  const { children } = props;

  const client = new RetromClient();

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
