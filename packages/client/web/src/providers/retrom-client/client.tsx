import type {
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
import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

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

    const transport = createConnectTransport({
      baseUrl: host,
    });

    this.gameClient = createPromiseClient(GameService, transport);

    this.platformClient = createPromiseClient(PlatformService, transport);

    this.emulatorClient = createPromiseClient(EmulatorService, transport);

    this.metadataClient = createPromiseClient(MetadataService, transport);

    this.libraryClient = createPromiseClient(LibraryService, transport);

    this.clientsClient = createPromiseClient(ClientService, transport);

    this.serverClient = createPromiseClient(ServerService, transport);

    this.jobClient = createPromiseClient(JobService, transport);

    this.fileExplorerClient = createPromiseClient(
      FileExplorerService,
      transport,
    );
  }
}
