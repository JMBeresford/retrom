import {
  GameServiceDefinition,
  PlatformServiceDefinition,
  EmulatorServiceDefinition,
  MetadataServiceDefinition,
  LibraryServiceDefinition,
} from "@/generated/retrom/services";
import { createClient, createChannel } from "nice-grpc-web";

export class RetromClient {
  public gameClient;
  public platformClient;
  public emulatorClient;
  public metadataClient;
  public libraryClient;

  constructor(host: string) {
    this.gameClient = createClient(GameServiceDefinition, createChannel(host));

    this.platformClient = createClient(
      PlatformServiceDefinition,
      createChannel(host),
    );

    this.emulatorClient = createClient(
      EmulatorServiceDefinition,
      createChannel(host),
    );

    this.metadataClient = createClient(
      MetadataServiceDefinition,
      createChannel(host),
    );

    this.libraryClient = createClient(
      LibraryServiceDefinition,
      createChannel(host),
    );
  }
}
