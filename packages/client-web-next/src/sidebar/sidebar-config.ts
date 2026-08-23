import type { ButtonVariants } from "@retrom/ui-next/components/button-variants";
import type {
  SidebarMenuButton,
  SidebarProps,
} from "@retrom/ui-next/components/sidebar";
import type { LinkProps } from "@tanstack/react-router";
import type { ComponentProps, ReactElement, ReactNode } from "react";

export interface SidebarConfig {
  header?: SidebarHeaderConfig;
  groups: Array<SidebarGroupConfig>;
  footer?: SidebarFooterConfig;
  variant?: SidebarProps["variant"];
}

export type SidebarHeaderConfig = {
  items: Array<SidebarMenuItemConfig>;
};

export type SidebarGroupConfig = {
  label?: ReactNode;
  action?: ReactNode;
  content?: ReactNode;
  menus: Array<SidebarMenuConfig>;
};

export type SidebarMenuConfig = {
  items: Array<SidebarMenuItemConfig>;
};

export type SidebarMenuItemConfig = {
  action?: ReactElement;
  badge?: ReactNode;
} & (
  | {
      type: "inline";
      size?: ComponentProps<typeof SidebarMenuButton>["size"];
      render: ComponentProps<typeof SidebarMenuButton>["render"];
    }
  | {
      type: "subMenu";
      subMenu: SidebarMenuConfig;
      label:
        | {
            children: ReactNode;
            render?: never;
          }
        | {
            render: ReactElement;
            children?: never;
          };
    }
  | {
      type: "button";
      variant?: ButtonVariants["variant"];
      label:
        | {
            children: ReactNode;
            render?: never;
          }
        | {
            render: ReactElement;
            children?: never;
          };
    }
  | { type: "link"; route: LinkProps["to"]; label: ReactNode }
);

export type SidebarFooterConfig = {
  items: Array<SidebarMenuItemConfig>;
};
