import { Link } from "@tanstack/react-router";
import { MenuItem, RootMenuItem } from "..";

const manageEmulatorsMenuItem: MenuItem = {
  label: "Manage Emulators",
  Render: (
    <Link to="." search={{ manageEmulatorsModal: { open: true } }}>
      Manage Emulators
    </Link>
  ),
};

const manageEmulatorProfilesMenuItem: MenuItem = {
  label: "Manage Profiles",
  appContext: "desktop",
  Render: (
    <Link to="." search={{ manageEmulatorProfilesModal: { open: true } }}>
      Manage Profiles
    </Link>
  ),
};

export const emulatorsMenu: RootMenuItem = {
  label: "Emulators",
  appContext: "desktop",
  items: [manageEmulatorsMenuItem, manageEmulatorProfilesMenuItem],
};
