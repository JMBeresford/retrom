import {
  ClientService,
  EmulatorService,
  FileExplorerService,
  GameService,
  JobService,
  LibraryService,
  MetadataService,
  PlatformService,
  ServerService,
} from "@retrom/codegen/retrom/services_pb";
import { createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";

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

    const transport = createGrpcWebTransport({
      baseUrl: host,
    });

    this.gameClient = createClient(GameService, transport);

    this.platformClient = createClient(PlatformService, transport);

    this.emulatorClient = createClient(EmulatorService, transport);

    this.metadataClient = createClient(MetadataService, transport);

    this.libraryClient = createClient(LibraryService, transport);

    this.clientsClient = createClient(ClientService, transport);

    this.serverClient = createClient(ServerService, transport);

    this.jobClient = createClient(JobService, transport);

    this.fileExplorerClient = createClient(FileExplorerService, transport);
  }
}
