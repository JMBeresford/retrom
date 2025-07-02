import { Link } from "@tanstack/react-router";
import { MenuItem } from "..";

const matchPlatformsMenuItem: MenuItem = {
  label: "Match Platforms",
  Render: (
    <Link to="." search={{ matchPlatformsModal: { open: true } }}>
      Match Platforms
    </Link>
  ),
};

const defaultProfilesMenuItem: MenuItem = {
  label: "Default Emulator Profiles",
  appContext: "desktop",
  Render: (
    <Link to="." search={{ defaultProfilesModal: { open: true } }}>
      Default Emulator Profiles
    </Link>
  ),
};

export const platformsMenu: MenuItem = {
  label: "Platforms",
  items: [matchPlatformsMenuItem, defaultProfilesMenuItem],
};
