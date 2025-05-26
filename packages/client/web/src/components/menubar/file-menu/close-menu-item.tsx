import { Link } from "@tanstack/react-router";
import { MenuItem } from "..";

export const exitMenuItem: MenuItem = {
  label: "Exit",
  appContext: "desktop",
  Render: (
    <Link
      className="text-destructive-text"
      to="."
      search={(prev) => ({ ...prev, exitModal: { open: true } })}
    >
      Exit Retrom
    </Link>
  ),
};
