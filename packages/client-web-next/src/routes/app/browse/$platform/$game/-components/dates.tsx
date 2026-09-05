import { timestampDate } from "@bufbuild/protobuf/wkt";
import { cn } from "@retrom/ui-next/lib/utils";
import { Fragment } from "react";
import type { HTMLAttributes } from "react";
import type { Game } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";

export type GameDatesProps = {
  game: Game;
  metadata: GameMetadata;
} & HTMLAttributes<HTMLDivElement>;

export function GameDates({
  game,
  metadata,
  className,
  ...props
}: GameDatesProps) {
  const lastPlayed = metadata.lastPlayed
    ? timestampDate(metadata.lastPlayed).toLocaleString(undefined, {
        dateStyle: "medium",
      })
    : "N/A";

  const playTime = metadata.minutesPlayed
    ? new Date(metadata.minutesPlayed * 60 * 1000).toLocaleString(undefined, {
        dateStyle: "medium",
      })
    : "N/A";

  const addedDate = game.createdAt
    ? timestampDate(game.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
      })
    : "Unknown";

  const releaseDate = metadata.releaseDate
    ? timestampDate(metadata.releaseDate).toLocaleString(undefined, {
        dateStyle: "medium",
      })
    : "Unknown";

  const items: Array<GameDateItemValue> = [
    { label: "Last Played", value: lastPlayed },
    { label: "Play Time", value: playTime },
    { label: "Added On", value: addedDate },
    { label: "Release Date", value: releaseDate },
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-around flex-wrap gap-4",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <Fragment key={index}>
          <GameDateItem label={item.label} value={item.value} />
        </Fragment>
      ))}
    </div>
  );
}

type GameDateItemValue = {
  label: string;
  value: string;
};

function GameDateItem({ label, value }: GameDateItemValue) {
  return (
    <div className="flex flex-col items-center">
      <h3 className="font-heading text-lg font-semibold">{label}</h3>
      <p className="text-muted-foreground text-sm">{value}</p>
    </div>
  );
}
