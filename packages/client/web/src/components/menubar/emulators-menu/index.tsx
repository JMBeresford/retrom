import { Link } from "@tanstack/react-router";
import { MenuItem } from "..";

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

export const emulatorsMenu: MenuItem = {
  label: "Emulators",
  items: [manageEmulatorsMenuItem, manageEmulatorProfilesMenuItem],
};
