import { Link } from "@tanstack/react-router";
import { MenuItem } from "..";

export const versionInfoMenuItem: MenuItem = {
  label: "Version Info",
  Render: (
    <Link search={{ versionInfoModal: { open: true } }}>Version Info</Link>
  ),
};
