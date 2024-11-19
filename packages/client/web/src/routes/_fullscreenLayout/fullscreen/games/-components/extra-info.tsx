import { cn, getFileStub, timestampToDate } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";
import { useMemo } from "react";

export function ExtraInfo() {
  const { gameMetadata, game, platform, platformMetadata } = useGameDetail();

  const playTime = useMemo(() => {
    const time = gameMetadata?.minutesPlayed;

    if (time === undefined) {
      return "Not played yet";
    }

    if (time > 60) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;

      return `${hours} hours ${minutes} minutes`;
    }

    return `${time} minutes`;
  }, [gameMetadata?.minutesPlayed]);

  const lastPlayed = useMemo(() => {
    const played = gameMetadata?.lastPlayed;

    if (!played) {
      return "Not played yet";
    }

    return timestampToDate(played).toLocaleString();
  }, [gameMetadata?.lastPlayed]);

  const addedOn = useMemo(() => {
    const timestamp = game.createdAt;

    if (!timestamp) {
      return "";
    }

    return timestampToDate(timestamp).toLocaleString();
  }, [game.createdAt]);

  const platformName = useMemo(() => {
    if (typeof platformMetadata?.name === "string") {
      return platformMetadata.name;
    }

    return getFileStub(platform.path) ?? "Unknown";
  }, [platformMetadata, platform.path]);

  return (
    <div
      className={cn(
        "flex gap-8 py-8 justify-between *:basis-0",
        "text-center border-secondary",
        "outline-none focus:border-accent",
      )}
    >
      <InfoItem title="Play Time" value={playTime} />
      <InfoItem title="Last Played" value={lastPlayed} />
      <InfoItem title="Added On" value={addedOn} />
      <InfoItem title="Platform" value={platformName} />
    </div>
  );
}

function InfoItem(props: { title: string; value: string }) {
  return (
    <div className="whitespace-nowrap">
      <h3 className="text-2xl font-bold uppercase">{props.title}</h3>
      <p className="text-muted-foreground">{props.value}</p>
    </div>
  );
}
