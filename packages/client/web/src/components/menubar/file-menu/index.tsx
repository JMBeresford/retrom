import { versionInfoMenuItem } from "./version-info-menu-item";
import { configMenuItem } from "./config-menu-item";
import { checkForUpdateMenuItem } from "./check-for-update-menu-item";
import { locationsMenuItem } from "./locations-menu-item";
import { setupMenuItem } from "./setup-menu-item";
import { closeMenuItem } from "./close-menu-item";
import { RootMenuItem } from "..";

export const fileMenu: RootMenuItem = {
  label: "File",
  items: [
    [configMenuItem],
    [versionInfoMenuItem, checkForUpdateMenuItem],
    [locationsMenuItem, setupMenuItem, closeMenuItem],
  ],
};
