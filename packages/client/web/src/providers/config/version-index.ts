import { Timestamp } from "@/generated/google/protobuf/timestamp";
import { InterfaceConfig_GameListEntryImage } from "@/generated/retrom/client/client-config";

export type ConfigV1 = {
  server?: {
    hostname?: string;
    port?: string;
  };
  config?: {
    clientInfo?: {
      name: string;
      id?: number;
      createdAt?: Timestamp;
      updatedAt?: Timestamp;
    };
  };
  flowCompletions?: {
    setupComplete?: boolean;
  };
};

export type ConfigV2 = ConfigV1 & {
  config?: {
    interface?: {
      fullscreenByDefault?: boolean;
      fullscreenConfig?: {
        gridList?: {
          columns?: number;
          gap?: number;
          imageType?: InterfaceConfig_GameListEntryImage;
        };
      };
    };
  };
};

export type ConfigV3 = ConfigV2 & {
  server?: {
    standalone?: boolean;
  };
};

export type ConfigV4 = ConfigV3 & {
  config?: { installationDir?: string };
};
