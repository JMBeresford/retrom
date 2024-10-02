import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";
import { getFileStub, timestampToDate } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";

export function GeneralInfo() {
  const { gameMetadata, platformMetadata, game, platform } = useGameDetail();

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
    <Card className="py-0">
      <CardContent className="py-4">
        <InfoItem title="Play Time" value={playTime} />

        <InfoItem title="Last Played" value={lastPlayed} />

        <InfoItem title="Added On" value={addedOn} />

        <InfoItem title="Platform" value={platformName} />
      </CardContent>
    </Card>
  );
}

function InfoItem(props: { title: string; value: string }) {
  return (
    <div className="mb-2">
      <h3 className="font-extrabold">{props.title}</h3>
      <p className="text-muted-foreground text-sm">{props.value}</p>
    </div>
  );
}
