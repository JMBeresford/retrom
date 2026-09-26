import { cn } from "@retrom/ui-next/lib/utils";
import { Skeleton } from "@retrom/ui-next/components/skeleton";
import { Link } from "@tanstack/react-router";
import { PlatformItemMenu } from "./platform-item-menu";
import type { HTMLAttributes, PropsWithChildren } from "react";
import logo from "@/assets/Logo.png";
import { useListGames } from "@/data/libraries/use-list-games";
import { useGetPlatformMetadata } from "@/data/metadata/use-get-platform-metadata";

export type PlatformItemProps = PropsWithChildren<
  {
    platformId: string;
  } & HTMLAttributes<HTMLElement>
>;

export function PlatformItem({
  platformId,
  className,
  ...props
}: PlatformItemProps) {
  const platformMetadataQuery = useGetPlatformMetadata({
    request: {
      name: `platforms/${platformId}/metadata`,
    },
  });

  const gamesQuery = useListGames({
    request: {
      platformIds: [platformId],
    },
  });

  const isPending = platformMetadataQuery.isPending || gamesQuery.isPending;
  const isError = platformMetadataQuery.isError || gamesQuery.isError;

  if (isPending) {
    return <Skeleton className="h-30 w-full" />;
  }

  if (isError) {
    return (
      <div
        className={cn(
          className,
          "h-30 grid place-items-center border rounded-md",
        )}
        {...props}
      >
        <p className="text-destructive">Error loading platform metadata</p>
      </div>
    );
  }

  const metadata = platformMetadataQuery.data;
  const numGames = gamesQuery.data.games.length;

  return (
    <Link
      to="/app/browse/$platform"
      params={{ platform: platformId }}
      className={cn(
        "group h-20 flex items-center",
        "rounded-md overflow-hidden",
        "bg-card shadow-md",
      )}
    >
      <div
        className={cn(
          "aspect-square h-full shrink-0",
          "relative overflow-hidden bg-accent/30",
          metadata.logoUrl &&
            "dark:bg-[color-mix(in_oklch,var(--primary)_90%,white)]",
        )}
      >
        <img
          src={metadata.logoUrl ?? logo}
          className={cn(
            metadata.logoUrl
              ? "p-2 scale-100 group-hover:scale-110"
              : "scale-105 group-hover:scale-115",
            "aspect-square transition-transform",
          )}
        />
      </div>

      <div className="w-full h-full flex gap-2 items-center px-2 py-1">
        <div className="flex flex-col w-full">
          <h3
            className={cn(
              "font-heading font-semibold",
              "group-hover:underline",
            )}
          >
            {metadata.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {numGames} {numGames === 1 ? "game" : "games"}
          </p>
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <PlatformItemMenu metadata={metadata} />
        </div>
      </div>
    </Link>
  );
}
