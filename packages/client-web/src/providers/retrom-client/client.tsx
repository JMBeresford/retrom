import { createClient } from "@connectrpc/connect";
import { GameService } from "@retrom/codegen/retrom/services/game-service_pb";
import { PlatformService } from "@retrom/codegen/retrom/services/platform-service_pb";
import { EmulatorService } from "@retrom/codegen/retrom/services/emulator-service_pb";
import { MetadataService } from "@retrom/codegen/retrom/services/metadata-service_pb";
import { LibraryService } from "@retrom/codegen/retrom/services/library-service_pb";
import { ClientService } from "@retrom/codegen/retrom/services/client-service_pb";
import { ServerService } from "@retrom/codegen/retrom/services/server-service_pb";
import { JobService } from "@retrom/codegen/retrom/services/job-service_pb";
import { FileExplorerService } from "@retrom/codegen/retrom/services/file-explorer-service_pb";
import { SavesService } from "@retrom/codegen/retrom/services/saves/v1/saves-service_pb";
import { EmulatorSavesService } from "@retrom/codegen/retrom/services/saves/v2/emulator-saves-service_pb";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { otelInterceptor } from "./otel";

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
  readonly savesClient;
  readonly emulatorSavesClient;

  constructor(host: string) {
    if (host.endsWith("/")) {
      host = host.slice(0, -1);
    }

    this.host = host;

    const transport = createGrpcWebTransport({
      baseUrl: host,
      interceptors: [otelInterceptor],
    });

    this.gameClient = createClient(GameService, transport);

    this.platformClient = createClient(PlatformService, transport);

    this.emulatorClient = createClient(EmulatorService, transport);

    this.metadataClient = createClient(MetadataService, transport);

    this.libraryClient = createClient(LibraryService, transport);

    this.clientsClient = createClient(ClientService, transport);

    this.savesClient = createClient(SavesService, transport);

    this.serverClient = createClient(ServerService, transport);

    this.jobClient = createClient(JobService, transport);

    this.fileExplorerClient = createClient(FileExplorerService, transport);

    this.emulatorSavesClient = createClient(EmulatorSavesService, transport);
  }
}
