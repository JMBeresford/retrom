import { Link } from "@tanstack/react-router";
import { MenuItem } from "..";

export const configMenuItem: MenuItem = {
  label: "Configuration",
  Render: (
    <Link to="." search={{ configModal: { open: true } }}>
      Configuration
    </Link>
  ),
};
