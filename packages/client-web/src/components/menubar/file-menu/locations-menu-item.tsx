import { openInstallationDir } from "@retrom/plugin-installer";
import { MenuItem } from "..";

export const locationsMenuItem: MenuItem = {
  label: "Locations",
  appContext: "desktop",
  items: [
    {
      label: "Open Installation Directory",
      action: () => void openInstallationDir(),
    },
  ],
};
