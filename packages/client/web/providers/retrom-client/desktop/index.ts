import { RetromClient } from "@/providers/retrom-client";
import { GameClient } from "./games";
import { PlatformClient } from "./platforms";
import { MetadataClient } from "./metadata";
import { LibraryClient } from "./library";

export class RetromDesktopClient implements RetromClient {
  public gameClient = new GameClient();
  public platformClient = new PlatformClient();
  public metadataClient = new MetadataClient();
  public libraryClient = new LibraryClient();
}
