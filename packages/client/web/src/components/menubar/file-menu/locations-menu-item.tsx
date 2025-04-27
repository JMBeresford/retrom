import { openInstallationDir } from "@retrom/plugin-installer";
import { MenuItem } from "..";

export const locationsMenuItem: MenuItem = {
  label: "Locations",
  appContext: "desktop",
  action: () => void openInstallationDir(),
  Render: "Open Installation Directory",
};
