import { Image } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import logo from "@/assets/img/LogoLong-NoBackground.png";
import { useGameDetail } from "@/providers/game-details";
import { createUrl, usePublicUrl } from "@/utils/urls";
import { useMemo } from "react";

export function CoverImage() {
  const publicUrl = usePublicUrl();
  const { gameMetadata, extraMetadata, name } = useGameDetail();

  const coverUrl = useMemo(() => {
    const localPath = extraMetadata?.mediaPaths?.coverUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.coverUrl;
  }, [publicUrl, gameMetadata, extraMetadata]);

  return (
    <div
      className={cn(
        "relative w-fit sm:min-w-full rounded-t-lg overflow-hidden",
        "min-h-[250px]",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 row-start-1 col-start-1",
          "grid place-items-center z-[-1] text-center px-6 py-16",
          "bg-gradient-to-t from-background/80 to-secondary/80",
        )}
      >
        <Image src={logo} alt="Retrom Logo" className="" />
      </div>

      {coverUrl ? (
        <div>
          <Image
            src={coverUrl}
            alt={name}
            className={cn(
              "row-start-1 col-start-1",
              "object-cover min-w-full min-h-full",
              "",
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
