import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@retrom/ui-next/components/item";
import { cn } from "@retrom/ui-next/lib/utils";
import type { HTMLAttributes, PropsWithChildren } from "react";

export type PlatformItemProps = PropsWithChildren<
  {
    platformId: string;
  } & HTMLAttributes<HTMLDivElement>
>;

export function PlatformItem({
  platformId,
  className,
  ...props
}: PlatformItemProps) {
  const name = "Name";
  const description =
    "Some long description about the platform that is very long and will be truncated with an ellipsis if it is too long to fit in the available space.";

  return (
    <Item className={cn(className)} {...props}>
      <ItemMedia>
        <img src={`https://avatar.vercel.sh/${platformId}`} />
      </ItemMedia>

      <ItemContent>
        <ItemTitle>{name}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
    </Item>
  );
}
