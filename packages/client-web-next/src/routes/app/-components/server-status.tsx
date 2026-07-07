import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@retrom/ui-next/components/item";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ServerCrash } from "lucide-react";
import { buttonVariants } from "@retrom/ui-next/components/button-variants";
import { CollapsibleSidebarItem } from "@/sidebar/collapsible-sidebar-item";

export function ServerStatus() {
  return (
    <CollapsibleSidebarItem
      collapsed={
        <div
          className={buttonVariants({ variant: "destructive", size: "icon" })}
        >
          <ServerCrash />
        </div>
      }
      expanded={
        <Item
          variant="destructive"
          size="xs"
          render={
            <Link to=".">
              <ItemMedia variant="icon">
                <ServerCrash />
              </ItemMedia>

              <ItemContent>
                <ItemTitle>Server Not Connected</ItemTitle>
                <ItemDescription>Check connection</ItemDescription>
              </ItemContent>

              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Link>
          }
        />
      }
    />
  );
}
