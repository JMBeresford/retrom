import { cn } from "@retrom/ui-next/lib/utils";
import { Skeleton } from "@retrom/ui-next/components/skeleton";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import { Link } from "@tanstack/react-router";
import { GameItemMenu } from "./game-item-menu";
import type { HTMLAttributes, PropsWithChildren } from "react";
import logo from "@/assets/Logo-9x16.png?url";
import { useGetGameMetadata } from "@/data/metadata/use-get-game-metadata";

export type GameItemProps = PropsWithChildren<
  {
    gameId: string;
  } & HTMLAttributes<HTMLElement>
>;

export function GameItem({ gameId, className, ...props }: GameItemProps) {
  const {
    data: metadata,
    isPending,
    isError,
  } = useGetGameMetadata({
    request: {
      name: `games/${gameId}/metadata`,
    },
  });

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
        <p className="text-destructive">Error loading game metadata</p>
      </div>
    );
  }

  return (
    <Link
      from="/app/browse/$platform/"
      to="/app/browse/$platform/$game"
      params={{
        game: gameId,
      }}
      className={cn(
        "group h-20 flex items-center",
        "rounded-md overflow-hidden",
        "bg-card shadow-md",
      )}
    >
      <div
        className={cn(
          "aspect-3/4 h-full shrink-0",
          "relative overflow-hidden bg-accent/30 dark:bg-secondary",
        )}
      >
        <img
          src={metadata.coverUrl || logo}
          className={cn(
            metadata.coverUrl
              ? "scale-100 group-hover:scale-110 object-contain"
              : "scale-105 group-hover:scale-115 object-cover",
            "aspect-3/4 transition-transform",
          )}
        />
      </div>

      <div
        className={cn(
          "relative w-full h-full px-4 py-2 overflow-hidden",
          "grid items-center grid-cols-[1fr_auto] gap-4",
        )}
      >
        <div className="relative flex flex-col w-full overflow-hidden">
          <h3
            className={cn(
              "overflow-hidden whitespace-nowrap text-ellipsis",
              "font-heading font-semibold",
              "group-hover:underline",
            )}
          >
            {metadata.title}
          </h3>
          <p className="text-muted-foreground text-sm">
            {metadata.lastPlayed
              ? `Last played: ${timestampDate(
                  metadata.lastPlayed,
                ).toLocaleString(undefined, {
                  dateStyle: "medium",
                })}`
              : "Not played yet"}
          </p>

          <p className="text-muted-foreground text-sm">
            {metadata.minutesPlayed
              ? `Played for ${metadata.minutesPlayed} minutes`
              : ""}
          </p>
        </div>

        <div
          className="w-max"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <GameItemMenu metadata={metadata} />
        </div>
      </div>
    </Link>
  );
}
