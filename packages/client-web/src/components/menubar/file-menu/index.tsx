import { versionInfoMenuItem } from "./version-info-menu-item";
import { configMenuItem } from "./config-menu-item";
import { checkForUpdateMenuItem } from "./check-for-update-menu-item";
import { locationsMenuItem } from "./locations-menu-item";
import { setupMenuItem } from "./setup-menu-item";
import { exitMenuItem } from "./close-menu-item";
import { MenuItem } from "..";

export const fileMenu: MenuItem = {
  label: "File",
  items: [
    { groupItems: [configMenuItem] },
    { groupItems: [versionInfoMenuItem, checkForUpdateMenuItem] },
    { groupItems: [locationsMenuItem, setupMenuItem, exitMenuItem] },
  ],
};
