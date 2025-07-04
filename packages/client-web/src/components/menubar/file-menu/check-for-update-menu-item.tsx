import { Link } from "@tanstack/react-router";
import { MenuItem } from "..";

export const checkForUpdateMenuItem: MenuItem = {
  label: "Check for updates",
  appContext: "desktop",
  Render: (
    <Link to="." search={{ checkForUpdateModal: { open: true } }}>
      Check for updates
    </Link>
  ),
};
