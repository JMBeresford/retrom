import {
  InterfaceConfig_GameListEntryImage,
  RetromClientConfig,
  RetromClientConfigSchema,
} from "@retrom/codegen/retrom/client/client-config_pb";
import { create } from "@bufbuild/protobuf";
import * as Versions from "./version-index";

export function migrate(
  oldConfig: unknown,
  oldVersion: number,
): RetromClientConfig {
  let migrationFn = migrationFns[oldVersion];
  let newConfig;

  while (migrationFn) {
    newConfig = migrationFn(oldConfig as object);
    oldVersion++;
    console.log(`Migrated to version ${oldVersion}`);
    migrationFn = migrationFns[oldVersion];
  }

  return create(RetromClientConfigSchema, newConfig);
}

const migrationFns: Record<number, (config: object) => object> = {
  1: migrateV1toV2,
  2: migrateV2toV3,
  3: migrateV3toV4,
  4: migrateV4toV5,
};

function migrateV1toV2(oldConfig: Versions.ConfigV1): Versions.ConfigV2 {
  const newConfig: Versions.ConfigV2 = oldConfig;

  newConfig.config = {
    ...newConfig.config,
    interface: {
      ...newConfig.config?.interface,
      fullscreenByDefault: false,
      fullscreenConfig: {
        gridList: {
          columns: 4,
          gap: 20,
          imageType: InterfaceConfig_GameListEntryImage.COVER,
        },
      },
    },
  };

  return newConfig;
}

function migrateV2toV3(oldConfig: Versions.ConfigV2): Versions.ConfigV3 {
  const newConfig: Versions.ConfigV3 = oldConfig;

  newConfig.server = {
    ...newConfig.server,
    standalone: false,
  };

  return newConfig;
}

function migrateV3toV4(oldConfig: Versions.ConfigV3): Versions.ConfigV4 {
  const newConfig: Versions.ConfigV4 = oldConfig;

  return newConfig;
}

function migrateV4toV5(oldConfig: Versions.ConfigV4): Versions.ConfigV5 {
  return {
    ...oldConfig,
    flowCompletions: {
      ...oldConfig.flowCompletions,
      telemetryEnabled: false,
    },
    telemetry: {
      enabled: false,
    },
  };
}
