"use client";

import { cn, getFileStub, Image } from "@/lib/utils";
import { useGameDetail } from "../game-details-context";

export function CoverImage() {
  const { game, gameMetadata } = useGameDetail();

  const name = gameMetadata?.name || getFileStub(game.path);
  //
  return (
    <div
      className={cn(
        "relative rounded-t-lg border min-w-full aspect-[3/4] overflow-hidden",
      )}
    >
      <div className="absolute inset-0 grid place-items-center z-[-1] bg-muted">
        <h5 className="font-semibold text-lg">{name}</h5>
      </div>
      {gameMetadata?.coverUrl && (
        <div>
          <Image
            src={gameMetadata.coverUrl}
            alt={name}
            className="object-cover min-w-full min-h-full"
          />
        </div>
      )}
    </div>
  );
}
