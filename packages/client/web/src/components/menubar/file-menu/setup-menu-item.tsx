import { Link } from "@tanstack/react-router";
import { MenuItem } from "..";

export const setupMenuItem: MenuItem = {
  label: "Setup",
  appContext: "desktop",
  Render: (
    <Link to="." search={{ setupModal: { open: true } }}>
      Setup
    </Link>
  ),
};
