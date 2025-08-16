import { getFileStub, Image } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useGameDetail } from "@/providers/game-details";
import { useMemo } from "react";
import { createUrl, usePublicUrl } from "@/utils/urls";

export function BackgroundImage() {
  const publicUrl = usePublicUrl();
  const { game, gameMetadata, extraMetadata } = useGameDetail();

  const name = gameMetadata?.name || getFileStub(game.path);
  const bgUrl = useMemo(() => {
    const localPath = extraMetadata?.mediaPaths?.backgroundUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.backgroundUrl;
  }, [publicUrl, gameMetadata, extraMetadata]);

  const coverUrl = useMemo(() => {
    const localPath = extraMetadata?.mediaPaths?.coverUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.coverUrl;
  }, [publicUrl, gameMetadata, extraMetadata]);

  const image = bgUrl || coverUrl;

  return (
    <div
      className={cn(
        "col-span-2 fixed top-0 left-0 right-0 h-[100dvh] z-[-1] overflow-hidden bg-secondary",
      )}
    >
      {image && (
        <Image
          src={image}
          alt={name ?? "Game Background"}
          className="object-cover absolute min-w-full min-h-full max-w-full max-h-full blur-xl"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background to-background/70"></div>
    </div>
  );
}
