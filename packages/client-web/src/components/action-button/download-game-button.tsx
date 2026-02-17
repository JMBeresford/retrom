import {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Button, ButtonProps } from "@retrom/ui/components/button";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { cn } from "@retrom/ui/lib/utils";
import { DownloadIcon } from "lucide-react";
import { useApiUrl } from "@/utils/urls";

export const DownloadGameButton = forwardRef(
  (
    props: ButtonProps & { game: Game },
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { game, className, ...rest } = props;

    const ref = useRef<HTMLButtonElement>(null!);
    const apiUrl = useApiUrl();
    const downloadUrl = useMemo(
      () => new URL(`rest/game/${game.id}`, apiUrl),
      [apiUrl, game.id],
    );

    useImperativeHandle(forwardedRef, () => ref.current);

    return (
      <Button
        ref={ref}
        type="submit"
        {...rest}
        disabled={game.thirdParty || rest.disabled}
        className={cn(className)}
        variant="accent"
        asChild
      >
        <a href={downloadUrl.toString()} target="_blank" rel="noreferrer">
          <DownloadIcon className="h-[1.2rem] w-[1.2rem]" />
          Download
        </a>
      </Button>
    );
  },
);

DownloadGameButton.displayName = "DownloadGameButton";
