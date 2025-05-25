import { openTelemetryClientMiddleware } from "nice-grpc-opentelemetry";
import {
  GameServiceDefinition,
  PlatformServiceDefinition,
  EmulatorServiceDefinition,
  MetadataServiceDefinition,
  LibraryServiceDefinition,
  ClientServiceDefinition,
  JobServiceDefinition,
  ServerServiceDefinition,
  FileExplorerServiceDefinition,
} from "@retrom/codegen/retrom/services";
import { createChannel, createClientFactory } from "nice-grpc-web";

const clientFactory = createClientFactory().use(
  openTelemetryClientMiddleware(),
);

export class RetromClient {
  readonly host: string;
  readonly gameClient;
  readonly platformClient;
  readonly emulatorClient;
  readonly metadataClient;
  readonly libraryClient;
  readonly clientsClient;
  readonly serverClient;
  readonly jobClient;
  readonly fileExplorerClient;

  constructor(host: string) {
    if (host.endsWith("/")) {
      host = host.slice(0, -1);
    }

    this.host = host;
    this.gameClient = clientFactory.create(
      GameServiceDefinition,
      createChannel(host),
    );

    this.platformClient = clientFactory.create(
      PlatformServiceDefinition,
      createChannel(host),
    );

    this.emulatorClient = clientFactory.create(
      EmulatorServiceDefinition,
      createChannel(host),
    );

    this.metadataClient = clientFactory.create(
      MetadataServiceDefinition,
      createChannel(host),
    );

    this.libraryClient = clientFactory.create(
      LibraryServiceDefinition,
      createChannel(host),
    );

    this.clientsClient = clientFactory.create(
      ClientServiceDefinition,
      createChannel(host),
    );

    this.serverClient = clientFactory.create(
      ServerServiceDefinition,
      createChannel(host),
    );

    this.jobClient = clientFactory.create(
      JobServiceDefinition,
      createChannel(host),
    );

    this.fileExplorerClient = clientFactory.create(
      FileExplorerServiceDefinition,
      createChannel(host),
    );
  }
}
