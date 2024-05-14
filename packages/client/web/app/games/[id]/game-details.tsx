"use client";

import styles from "./game-details.module.scss";
import { cn, Image } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Game, GameMetadata } from "@/generated/retrom";

type Props = {
  game: Game;
  metadata?: GameMetadata;
};

export function GameDetails(props: Props) {
  const { game, metadata } = props;

  return (
    <div className={cn(styles.details, "")}>
      <div
        className={cn(styles.background, "relative border-b h-auto bg-accent")}
      >
        {metadata?.backgroundUrl && metadata?.name && (
          <Image
            src={metadata.backgroundUrl}
            alt={metadata.name}
            fill
            className="object-cover aspect-video max-h-[800px]"
          />
        )}
      </div>

      <div
        className={cn(
          styles.coverActions,
          "flex flex-col justify-center py-16",
        )}
      >
        <div className={cn("border-2 mx-3", "relative w-[264px] h-[374px]")}>
          {metadata?.coverUrl && metadata?.name && (
            <Image src={metadata.coverUrl} alt={metadata.name} fill />
          )}
        </div>
        <DialogTrigger asChild>
          <Button className="m-3">Edit</Button>
        </DialogTrigger>
      </div>

      <div className={styles.info}>
        <h1 className={cn(styles.title, "font-black text-3xl py-3")}>
          {metadata?.name}
        </h1>

        <p className={cn(styles.description, "max-w-[80ch]")}>
          {metadata?.description || "No description available."}
        </p>
      </div>
    </div>
  );
}
