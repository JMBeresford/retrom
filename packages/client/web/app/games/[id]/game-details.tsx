import styles from "./game-details.module.scss";
import { cn, getFileName, Image } from "@/lib/utils";
import { Game, GameMetadata, Platform } from "@/generated/retrom";
import { Actions } from "./actions";
import { GameDetailContext } from "./game-context";

type Props = GameDetailContext;

export async function GameDetails(props: Props) {
  const { game, gameMetadata } = props;

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
            fill
            className="object-cover absolute w-full"
          />
        )}
      </div>

      <div
        className={cn(
          styles.coverActions,
          "flex flex-col justify-center py-16 px-3 gap-2",
        )}
      >
        <div className={cn("border-2", "relative w-[264px] h-[374px]")}>
          {gameMetadata?.coverUrl && gameMetadata?.name && (
            <Image src={gameMetadata.coverUrl} alt={gameMetadata.name} fill />
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
