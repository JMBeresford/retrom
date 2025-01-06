import {
  InterfaceConfig_GameListEntryImage,
  RetromClientConfig,
} from "@/generated/retrom/client/client-config";
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

  return RetromClientConfig.create(newConfig);
}

const migrationFns: Record<number, (config: object) => object> = {
  1: migrateV1toV2,
  2: migrateV2toV3,
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
