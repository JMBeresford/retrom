import { Link } from "@tanstack/react-router";
import { RootMenuItem } from "..";

const matchPlatformsMenuItem = {
  label: "Match Platforms",
  Render: (
    <Link to="." search={{ matchPlatformsModal: { open: true } }}>
      Match Platforms
    </Link>
  ),
};

const defaultProfilesMenuItem = {
  label: "Default Emulator Profiles",
  context: "desktop",
  Render: (
    <Link to="." search={{ defaultProfilesModal: { open: true } }}>
      Default Emulator Profiles
    </Link>
  ),
};

export const platformsMenu: RootMenuItem = {
  label: "Platforms",
  items: [matchPlatformsMenuItem, defaultProfilesMenuItem],
};
