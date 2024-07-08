"use client";

import styles from "./game-details.module.scss";
import { cn, getFileName, Image } from "@/lib/utils";
import { Actions } from "./actions";
import { useGameDetail } from "./game-context";

export function GameDetails() {
  const { game, gameMetadata } = useGameDetail();

  const name = gameMetadata?.name || getFileName(game.path);

  return (
    <div className={cn(styles.details, "")}>
      <div
        className={cn(
          styles.background,
          "relative h-[clamp(200px,60vh,800px)] overflow-hidden border-b bg-accent",
        )}
      >
        {gameMetadata?.backgroundUrl && gameMetadata?.name && (
          <Image
            src={gameMetadata.backgroundUrl}
            alt={gameMetadata.name}
            className="object-cover absolute min-w-full min-h-full max-w-full max-h-full"
          />
        )}
      </div>

      <div
        className={cn(
          styles.coverActions,
          "flex flex-col justify-center py-16 px-3 gap-2",
        )}
      >
        <div className={cn("border-2", "relative")}>
          {gameMetadata?.coverUrl && gameMetadata?.name && (
            <Image
              src={gameMetadata.coverUrl}
              alt={gameMetadata.name}
              className="object-cover min-w-full min-h-full"
            />
          )}
        </div>

        <Actions />
      </div>

      <div className={styles.info}>
        <h1 className={cn(styles.title, "font-black text-3xl py-3")}>{name}</h1>

        <p className={cn(styles.description, "max-w-[80ch]")}>
          {gameMetadata?.description || "No description available."}
        </p>
      </div>
    </div>
  );
}
