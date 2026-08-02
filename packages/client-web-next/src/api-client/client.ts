import { createClient } from "@connectrpc/connect";
import { LibraryService } from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import { EmulatorService } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import { MetadataService } from "@retrom/codegen/retrom/services/metadata/v1/metadata_service_pb";
import { ClientService } from "@retrom/codegen/retrom/services/clients/v1/clients_service_pb";
import { JobService } from "@retrom/codegen/retrom/services/jobs/v1/job_service_pb";
import { FileExplorerService } from "@retrom/codegen/retrom/services/file_explorer/v1/file_explorer_service_pb";
import { SavesService } from "@retrom/codegen/retrom/services/saves/v1/saves-service_pb";
import { EmulatorSavesService } from "@retrom/codegen/retrom/services/saves/v2/emulator_saves_service_pb";
import type { Transport } from "@connectrpc/connect";

export class RetromClient {
  readonly libraryClient;
  readonly emulatorClient;
  readonly metadataClient;
  readonly clientsClient;
  readonly jobClient;
  readonly fileExplorerClient;
  readonly savesV1Client;
  readonly emulatorSavesClient;

  constructor(protected transport: Transport) {
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
