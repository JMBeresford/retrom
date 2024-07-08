import { RetromClient } from "@/providers/retrom-client";
import { createChannel, createClient } from "nice-grpc-web";
import {
  EmulatorServiceDefinition,
  LibraryServiceDefinition,
  GameServiceDefinition,
  PlatformServiceDefinition,
  MetadataServiceDefinition,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";

export class RetromDesktopClient implements RetromClient {
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
