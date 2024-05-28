import { RetromGameClient } from "./game-client";
import { RetromLibraryClient } from "./library-client";
import { RetromMetadataClient } from "./metadata-client";
import { RetromPlatformClient } from "./platform-client";

export interface RetromClient {
  readonly libraryClient: RetromLibraryClient;
  readonly platformClient: RetromPlatformClient;
  readonly gameClient: RetromGameClient;
  readonly metadataClient: RetromMetadataClient;
}
