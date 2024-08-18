import {
  GameServiceDefinition,
  PlatformServiceDefinition,
  EmulatorServiceDefinition,
  MetadataServiceDefinition,
  LibraryServiceDefinition,
  ClientServiceDefinition,
} from "@/generated/retrom/services";
import { createClient, createChannel } from "nice-grpc-web";

export class RetromClient {
  readonly host: string;
  public gameClient;
  public platformClient;
  public emulatorClient;
  public metadataClient;
  public libraryClient;
  public clientsClient;

  constructor(host: string) {
    this.host = host;
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

    this.clientsClient = createClient(
      ClientServiceDefinition,
      createChannel(host),
    );
  }
}
