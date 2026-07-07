import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retrom/ui-next/components/accordion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@retrom/ui-next/components/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import { useSidebar } from "@retrom/ui-next/hooks/use-sidebar";
import type { ComponentPropsWithoutRef } from "react";
import type {
  SidebarConfig,
  SidebarFooterConfig,
  SidebarGroupConfig,
  SidebarHeaderConfig,
  SidebarMenuConfig,
  SidebarMenuItemConfig,
} from "./sidebar-config";

export type AppSidebarProps = ComponentPropsWithoutRef<"div"> & {
  config: SidebarConfig;
};

export function AppSidebar({
  config: { variant = "floating", header, groups: items, footer },
  children,
  ...props
}: AppSidebarProps) {
  return (
    <>
      <Sidebar collapsible="icon" variant={variant} {...props}>
        {header ? <AppSidebarHeader config={header} /> : null}

        <SidebarContent className="py-2">
          <Accordion>
            {items.map((groupConfig, idx) => (
              <AppSidebarGroup key={idx} config={groupConfig} />
            ))}
          </Accordion>
        </SidebarContent>

        {footer ? <AppSidebarFooter config={footer} /> : null}
      </Sidebar>

      <SidebarInset>{children}</SidebarInset>
    </>
  );
}

function AppSidebarHeader({ config }: { config: SidebarHeaderConfig }) {
  const { items } = config;

  return (
    <SidebarHeader>
      <SidebarMenu>
        {items.map((itemConfig, idx) => (
          <AppSidebarMenuItem key={idx} config={itemConfig} />
        ))}
      </SidebarMenu>
    </SidebarHeader>
  );
}

function AppSidebarGroup({ config }: { config: SidebarGroupConfig }) {
  const { label, action, menus: items, content } = config;

  return (
    <SidebarGroup className="not-last:border-b border-border">
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      {action ? <SidebarGroupAction>{action}</SidebarGroupAction> : null}
      {content ? <SidebarGroupContent>{content}</SidebarGroupContent> : null}

      {items.map((menuConfig, idx) => (
        <AppSidebarMenu key={idx} config={menuConfig} />
      ))}
    </SidebarGroup>
  );
}

function AppSidebarMenu({
  config,
  sub = false,
}: {
  config: SidebarMenuConfig;
  sub?: boolean;
}) {
  const { items } = config;
  const MenuComponent = sub ? SidebarMenuSub : SidebarMenu;

  return (
    <MenuComponent>
      {items.map((itemConfig, idx) =>
        itemConfig.type === "subMenu" ? (
          <AccordionItem
            key={idx}
            value={`menu-${idx}`}
            render={<AppSidebarMenuItem config={itemConfig} sub={sub} />}
          />
        ) : (
          <AppSidebarMenuItem key={idx} config={itemConfig} sub={sub} />
        ),
      )}
    </MenuComponent>
  );
}

function AppSidebarMenuItem({
  config,
  sub = false,
}: {
  config: SidebarMenuItemConfig;
  sub?: boolean;
}) {
  const { open } = useSidebar();
  const { action, badge } = config;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const ItemComponent = sub ? SidebarMenuSubItem : SidebarMenuItem;
  const size = sub ? "sm" : "default";
  const isActive = config.type === "link" && pathname === config.route;

  return (
    <ItemComponent>
      {config.type === "subMenu" ? (
        <SidebarMenuButton
          hidden={open === false}
          size={size}
          isActive={isActive}
          render={
            <AccordionTrigger
              className="no-underline font-normal"
              {...config.label}
            />
          }
        />
      ) : config.type === "link" ? (
        <SidebarMenuButton
          size={size}
          isActive={isActive}
          render={<Link to={config.route}>{config.label}</Link>}
        ></SidebarMenuButton>
      ) : config.type === "inline" ? (
        <SidebarMenuButton
          size="fit"
          variant="inline"
          render={config.content}
        />
      ) : (
        <SidebarMenuButton size={size} isActive={isActive} {...config.label} />
      )}

      {action ? <SidebarMenuAction render={action} /> : null}
      {badge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}

      {config.type === "subMenu" ? (
        <AccordionContent>
          <AppSidebarMenu config={config.subMenu} sub={true} />
        </AccordionContent>
      ) : null}
    </ItemComponent>
  );
}

function AppSidebarFooter({ config }: { config: SidebarFooterConfig }) {
  const { items } = config;

  return (
    <SidebarFooter>
      <SidebarMenu className="gap-2">
        {items.map((itemConfig, idx) => (
          <AppSidebarMenuItem key={idx} config={itemConfig} />
        ))}
      </SidebarMenu>
    </SidebarFooter>
  );
}
