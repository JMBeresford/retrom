import {
  GameServiceDefinition,
  PlatformServiceDefinition,
  EmulatorServiceDefinition,
  MetadataServiceDefinition,
  LibraryServiceDefinition,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createClient, createChannel } from "nice-grpc-web";

export class RetromClient {
  public gameClient;
  public platformClient;
  public emulatorClient;
  public metadataClient;
  public libraryClient;

  constructor(host?: string) {
    this.gameClient = createClient(
      GameServiceDefinition,
      createChannel(host || GRPC_HOST()),
    );

    this.platformClient = createClient(
      PlatformServiceDefinition,
      createChannel(host || GRPC_HOST()),
    );

    this.emulatorClient = createClient(
      EmulatorServiceDefinition,
      createChannel(host || GRPC_HOST()),
    );

    this.metadataClient = createClient(
      MetadataServiceDefinition,
      createChannel(host || GRPC_HOST()),
    );

    this.libraryClient = createClient(
      LibraryServiceDefinition,
      createChannel(host || GRPC_HOST()),
    );
  }
}
