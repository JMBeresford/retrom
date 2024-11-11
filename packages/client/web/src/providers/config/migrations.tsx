/* eslint-disable @typescript-eslint/no-explicit-any -- This rule is disabled because the file is a migration file */
import { InterfaceConfig_GameListEntryImage } from "@/generated/retrom/client/client-config";
import { LocalConfig } from ".";

export function migrate(oldConfig: unknown, oldVersion: number) {
  let newConfig = oldConfig;
  switch (oldVersion) {
    case 1: {
      newConfig = migrateV1toV2(oldConfig);
    }
  }

  return newConfig;
}

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
