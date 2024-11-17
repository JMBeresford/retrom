import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from "react";
import { Button, ButtonProps } from "../ui/button";
import { Game } from "@/generated/retrom/models/games";
import { checkIsDesktop } from "@/lib/env";
import { useConfigStore } from "@/providers/config";
import { cn } from "@/lib/utils";
import { DownloadIcon } from "lucide-react";
import { FocusableElement } from "../fullscreen/focus-container";

export const DownloadGameButton = forwardRef(
  (
    props: ButtonProps & { game: Game },
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const ref = useRef<HTMLButtonElement>(null!);
    useImperativeHandle(forwardedRef, () => ref.current);

    const { game, className, ...rest } = props;
    const configStore = useConfigStore();
    const server = configStore((store) => store.server);

    const restHost = checkIsDesktop()
      ? `${server.hostname}:${server.port}/rest`
      : "/api/rest";

    return (
      <form action={`${restHost}/game/${game.id}`} className="w-full">
        <FocusableElement
          initialFocus
          ref={ref}
          opts={{ focusKey: "download-game-button", forceFocus: true }}
        >
          <Button
            ref={forwardedRef}
            type="submit"
            {...rest}
            className={cn(className)}
            variant="accent"
          >
            <DownloadIcon className="h-[1.2rem] w-[1.2rem]" />
            Download
          </Button>
        </FocusableElement>
      </form>
    );
  },
);
