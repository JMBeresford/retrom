import { Timestamp } from "@retrom/codegen/google/protobuf/timestamp_pb.js";
import { InterfaceConfig_GameListEntryImage } from "@retrom/codegen/retrom/client/client-config_pb.js";

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
