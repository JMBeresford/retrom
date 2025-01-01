/* eslint-disable @typescript-eslint/no-explicit-any -- This rule is disabled because the file is a migration file */
import {
  InterfaceConfig_GameListEntryImage,
  RetromClientConfig,
} from "@/generated/retrom/client/client-config";
import { LocalConfig } from ".";

export function migrate(
  oldConfig: unknown,
  oldVersion: number,
): RetromClientConfig {
  let newConfig = oldConfig;

  let migrationFn = migrationFns[oldVersion];
  while (migrationFn) {
    newConfig = migrationFn(newConfig);
    oldVersion++;
    console.log(`Migrated to version ${oldVersion}`);
    migrationFn = migrationFns[oldVersion];
  }

  return RetromClientConfig.create(newConfig as any);
}

const migrationFns: Record<number, (config: unknown) => unknown> = {
  1: migrateV1toV2,
  2: migrateV2toV3,
};

function migrateV1toV2(oldConfig: unknown) {
  const newConfig = oldConfig as any;

  newConfig.config = {
    ...newConfig.config,
    interface: {
      ...newConfig.config.interface,
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

  return oldConfig as LocalConfig;
}

function migrateV2toV3(oldConfig: unknown) {
  const newConfig = oldConfig as any;

  newConfig.server = {
    ...newConfig.server,
    standalone: false,
  };

  return oldConfig as LocalConfig;
}
