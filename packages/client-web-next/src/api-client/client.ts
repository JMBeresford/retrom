import { createClient } from "@connectrpc/connect";
import { LibraryService } from "@retrom/codegen/retrom/services/library/v1/library-service_pb";
import { EmulatorService } from "@retrom/codegen/retrom/services/emulators/v1/emulator-service_pb";
import { MetadataService } from "@retrom/codegen/retrom/services/metadata/v1/metadata-service_pb";
import { ClientService } from "@retrom/codegen/retrom/services/clients/v1/clients-service_pb";
import { JobService } from "@retrom/codegen/retrom/services/jobs/v1/job-service_pb";
import { FileExplorerService } from "@retrom/codegen/retrom/services/file-explorer/v1/file-explorer-service_pb";
import { SavesService } from "@retrom/codegen/retrom/services/saves/v1/saves-service_pb";
import { EmulatorSavesService } from "@retrom/codegen/retrom/services/saves/v2/emulator-saves-service_pb";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { otelInterceptor } from "./otel";

export class RetromClient {
  readonly host: string;
  readonly libraryClient;
  readonly emulatorClient;
  readonly metadataClient;
  readonly clientsClient;
  readonly jobClient;
  readonly fileExplorerClient;
  readonly savesV1Client;
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

    this.libraryClient = createClient(LibraryService, transport);
    this.emulatorClient = createClient(EmulatorService, transport);
    this.metadataClient = createClient(MetadataService, transport);
    this.clientsClient = createClient(ClientService, transport);
    this.savesV1Client = createClient(SavesService, transport);
    this.jobClient = createClient(JobService, transport);
    this.fileExplorerClient = createClient(FileExplorerService, transport);
    this.emulatorSavesClient = createClient(EmulatorSavesService, transport);
  }
}
