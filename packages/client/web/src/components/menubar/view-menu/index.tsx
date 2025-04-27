import { MenuItem, RootMenuItem } from "..";
import { Link } from "@tanstack/react-router";

const fullscreenMenuItem: MenuItem = {
  label: "Fullscreen Mode",
  Render: <Link to="/fullscreen">Fullscreen Mode</Link>,
};

export const viewMenu: RootMenuItem = {
  label: "View",
  viewportContext: "desktop",
  items: [fullscreenMenuItem],
};
