import { Link } from "@tanstack/react-router";
import { MenuItem, RootMenuItem } from "..";

const manageEulatorsMenuItem: MenuItem = {
  label: "Manage Emulators",
  appContext: "desktop",
  Render: (
    <Link search={{ manageEmulatorsModal: { open: true } }}>
      Manage Emulators
    </Link>
  ),
};

const manageEmulatorProfilesMenuItem: MenuItem = {
  label: "Manage Profiles",
  appContext: "desktop",
  Render: (
    <Link search={{ manageEmulatorProfilesModal: { open: true } }}>
      Manage Profiles
    </Link>
  ),
};

export const emulatorsMenu: RootMenuItem = {
  label: "Emulators",
  appContext: "desktop",
  items: [manageEulatorsMenuItem, manageEmulatorProfilesMenuItem],
};
